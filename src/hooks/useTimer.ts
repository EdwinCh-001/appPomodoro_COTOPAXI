/**
 * Hook `useTimer` — estado de la sesión en la interfaz (HU-001, HU-002).
 *
 * Posee el estado en memoria (sin persistencia: spec 003 la añadirá) y
 * delega todas las reglas en las funciones puras de `src/domain/`.
 * El tick recalcula el restante por diferencia de fechas absolutas
 * (RNF-1; decisiones 001 #1, #3), nunca decrementando un contador.
 *
 * Al llegar una fase a cero se aplica **una sola** transición de ciclo
 * y la siguiente fase queda preparada, sin arrancar sola
 * (RF-4, RF-9; decisiones 002 #2).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PhaseKind } from '@/domain/cycle';
import {
  type PendingNotice,
  reconcile,
  toSnapshot,
} from '@/domain/reconcile';
import {
  type PhaseDurations,
  type SessionState,
  applySessionSettings,
  advancePhase,
  createSession,
  createReadyTimer,
  endSession as endSessionState,
  sessionRemaining,
  skipPhase,
} from '@/domain/session';
import {
  computeRemaining,
  isDone,
  pause as pausePhase,
  resetPhase,
  resume as resumePhase,
  startPhase,
} from '@/domain/timer';
import {
  cancelPhaseEnd,
  schedulePhaseEnd,
} from '@/notifications/scheduler';
import { loadSnapshot, saveSnapshot } from '@/storage/sessionSnapshot';

/** Intervalo del tick en ms. Solo recalcula; no descuenta por conteo. */
const TICK_MS = 250;

export interface UseTimerOptions {
  /** Duraciones por tipo de fase, derivadas de los ajustes (spec 005). */
  durations: PhaseDurations;
  /** Pomodoros necesarios para el descanso largo (spec 005). */
  targetPomodoros: number;
  /**
   * Se llama cuando una fase termina **con la app abierta** (el tick
   * aplicó la transición o la reconciliación la encontró vencida). La
   * pantalla la usa para la alarma in-app (spec 004, RF-3).
   */
  onPhaseFinished?: (phaseKind: PhaseKind) => void;
}

export interface UseTimerResult {
  /** Fase activa (estudio o descanso). */
  phaseKind: PhaseKind;
  /** Estado de la fase activa (`ready` | `running` | `paused` | `done`). */
  status: SessionState['timer']['status'];
  /** Segundos restantes a mostrar (congelado fuera de curso). */
  remainingSeconds: number;
  /** Pomodoros completados en el ciclo actual. */
  completedPomodoros: number;
  /** Pomodoros necesarios para el descanso largo. */
  targetPomodoros: number;
  /**
   * Ciclo completado esperando "Terminar sesión" (enmienda fin de sesión
   * 2026-10-20). En este estado no hay fase corriendo.
   */
  sessionEnded: boolean;
  /** Inicia la fase preparada (RF-1 de la spec 001). */
  start: () => void;
  /** Pausa congelando el restante exacto. */
  pause: () => void;
  /** Reanuda desde el momento de la pausa. */
  resume: () => void;
  /** Vuelve al tiempo inicial de la fase sin tocar el contador. */
  reset: () => void;
  /** Omite el descanso activo (RF-6). Sin efecto durante el estudio. */
  skip: () => void;
  /**
   * Cierra la sesión terminada y prepara un ciclo nuevo desde cero,
   * esperando Iniciar (RF-11 de la spec 002).
   */
  endSession: () => void;
  /** `false` mientras se lee el snapshot guardado (RF-3). */
  ready: boolean;
  /** Aviso de fin ocurrido con la app cerrada (RF-4; lo consume la spec 004). */
  pendingNotice: PendingNotice | null;
  /** Descarta el aviso pendiente ya entregado. */
  clearPendingNotice: () => void;
}

/**
 * Estado de la sesión con tick por diferencia de fechas y persistencia
 * local (spec 003). Al arrancar carga el snapshot, lo reconcilia y
 * persiste el resultado; durante el uso persiste en cada transición y
 * en cada tick (RF-7).
 */
export function useTimer({
  durations,
  targetPomodoros,
  onPhaseFinished,
}: UseTimerOptions): UseTimerResult {
  // `null` mientras se hidrata desde el disco: evita parpadeos y garantiza
  // que la UI nunca muestre un estado ya vencido (RF-3, RF-4).
  const [session, setSession] = useState<SessionState | null>(null);

  // Reloj de referencia para el render. Lo mueve el tick mientras la fase
  // está en curso y las acciones (pausar/reanudar/reiniciar). Nunca se
  // llama `Date.now()` durante el render.
  const [now, setNow] = useState(() => Date.now());

  const [pendingNotice, setPendingNotice] = useState<PendingNotice | null>(
    null,
  );

  // Evita guardar en disco antes de terminar la carga inicial.
  const hydratedRef = useRef(false);
  // El tick marca aquí que una fase llegó a cero por su cuenta (no por
  // pausar/reiniciar/omitir). `finishedTick` cambia para disparar el
  // efecto de alarma in-app (spec 004, RF-3) y `finishedPhaseRef` lleva la
  // fase que terminó, sin setState dentro del efecto.
  const [finishedTick, setFinishedTick] = useState(0);
  const finishedPhaseRef = useRef<PhaseKind>('study');
  // Fase en curso actual, para que el tick sepa qué fase terminó sin
  // depender de valores capturados en el cierre del intervalo.
  const runningPhaseRef = useRef<PhaseKind>('study');

  // Usa una sesión coherente con los ajustes en pantalla: si los ajustes
  // cambiaron, el ciclo se reinicia de cero con los valores nuevos.
  const effectiveSession =
    session === null
      ? null
      : applySessionSettings(session, durations, targetPomodoros);
  const timer = effectiveSession?.timer ?? null;

  // Arranque: cargar → reconciliar → render → persistir lo reconciliado.
  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      const snapshot = await loadSnapshot();
      const at = Date.now();
      const { session: reconciled, pendingNotice: notice } = reconcile(
        snapshot,
        at,
      );
      if (cancelled) {
        return;
      }
      hydratedRef.current = true;
      setNow(at);
      setSession(reconciled);
      setPendingNotice(notice);
      // Deja en disco el estado ya reconciliado (RF-4, RF-7).
      await saveSnapshot(toSnapshot(reconciled));
    };

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, []);

  // Tick: solo mientras la fase está en curso; deriva del timestamp.
  useEffect(() => {
    if (timer === null || timer.status !== 'running' || timer.endAt === null) {
      return;
    }
    // Recuerda la fase que corre ahora, para asociar el fin a la fase
    // correcta cuando el tick lo detecte.
    runningPhaseRef.current = effectiveSession?.phaseKind ?? runningPhaseRef.current;
    const intervalId = setInterval(() => {
      const tickNow = Date.now();
      setNow(tickNow);

      // Detección del fin **fuera** del actualizador de estado, para no
      // meter efectos secundarios en un updater (debe ser puro). El
      // `endAt` es fijo mientras corre, así que el `timer` del render
      // sirve aunque tenga hasta un tick de antigüedad.
      const reachedEnd = timer.endAt !== null && isDone(timer, tickNow);

      setSession((prev) => {
        if (prev === null) {
          return prev;
        }
        const configured = applySessionSettings(
          prev,
          durations,
          targetPomodoros,
        );
        const prevTimer = configured.timer;
        if (prevTimer.status !== 'running' || prevTimer.endAt === null) {
          return configured;
        }
        if (reachedEnd) {
          // RF-9: marca la fase terminada y prepara la siguiente
          // (RF-1, RF-2, RF-3). Una sola transición por fase: el estado
          // resultante ya no está `running`, así que el tick se detiene.
          return advancePhase(
            {
              ...configured,
              timer: {
                ...prevTimer,
                status: 'done',
                endAt: null,
                remainingSeconds: 0,
              },
            },
            tickNow,
          );
        }
        const remainingSeconds = computeRemaining(prevTimer.endAt, tickNow);
        return remainingSeconds === prevTimer.remainingSeconds
          ? configured
          : { ...configured, timer: { ...prevTimer, remainingSeconds } };
      });

      if (reachedEnd) {
        // Solo cuando el fin lo provocó la cuenta (no pausar/reiniciar/
        // omitir): dispara la alarma in-app (spec 004, RF-3).
        finishedPhaseRef.current = runningPhaseRef.current;
        setFinishedTick((n) => n + 1);
      }
    }, TICK_MS);
    return () => clearInterval(intervalId);
  }, [
    timer,
    durations,
    targetPomodoros,
    effectiveSession?.phaseKind,
  ]);

  // Persistencia: se guarda en cada cambio de estado relevante
  // (iniciar, pausar, reanudar, cambio de fase) y como máximo una vez por
  // segundo durante la cuenta en curso, para no castigar el
  // almacenamiento con el tick de 250 ms (RF-7, RNF-2).
  const lastSavedRef = useRef(0);
  useEffect(() => {
    if (!hydratedRef.current || effectiveSession === null) {
      return;
    }
    const running = effectiveSession.timer.status === 'running';
    const at = Date.now();
    if (running && at - lastSavedRef.current < 1000) {
      return;
    }
    lastSavedRef.current = at;
    void saveSnapshot(toSnapshot(effectiveSession));
  }, [effectiveSession]);

  // Aviso programado (spec 004, RF-1, RF-2, RF-7): mientras la fase está
  // en curso se programa la notificación para su instante exacto de fin;
  // en cualquier otro estado (lista, pausada, terminada, sesión cerrada)
  // no debe quedar ningún aviso pendiente.
  useEffect(() => {
    if (effectiveSession === null) {
      return;
    }
    const { timer: current, phaseKind, sessionEnded } = effectiveSession;

    if (current.status === 'running' && current.endAt !== null && !sessionEnded) {
      void schedulePhaseEnd(phaseKind, current.endAt);
    } else {
      void cancelPhaseEnd(phaseKind);
    }
  }, [effectiveSession]);

  // Detección del fin de fase con la app abierta (spec 004, RF-3): consume
  // la marca del tick para disparar la alarma in-app. No se activa al
  // pausar, reiniciar, omitir ni al hidratar: solo el fin por cuenta
  // propia de la fase incrementa `finishedTick`.
  useEffect(() => {
    if (finishedTick === 0 || onPhaseFinished === undefined) {
      return;
    }
    onPhaseFinished(finishedPhaseRef.current);
  }, [finishedTick, onPhaseFinished]);

  const start = useCallback(() => {
    const at = Date.now();
    setNow(at);
    setSession((prev) => {
      if (prev === null) {
        return prev;
      }
      const configured = applySessionSettings(
        prev,
        durations,
        targetPomodoros,
      );
      // En la sesión terminada solo cabe pulsar "Terminar sesión".
      if (configured.sessionEnded) {
        return configured;
      }
      // Iniciar dos veces seguidas no reinicia ni duplica la cuenta.
      if (
        configured.timer.status === 'running' ||
        configured.timer.status === 'paused'
      ) {
        return configured;
      }
      // Al iniciar se adoptan los ajustes vigentes: la fase arranca con la
      // duración que corresponde en este instante.
      const durationSeconds =
        configured.timer.status === 'ready'
          ? configured.durations[configured.phaseKind]
          : configured.timer.durationSeconds;
      return { ...configured, timer: startPhase(durationSeconds, at) };
    });
  }, [durations, targetPomodoros]);

  const pause = useCallback(() => {
    const at = Date.now();
    setNow(at);
    setSession((prev) => {
      if (prev === null) {
        return prev;
      }
      const configured = applySessionSettings(prev, durations, targetPomodoros);
      return { ...configured, timer: pausePhase(configured.timer, at) };
    });
  }, [durations, targetPomodoros]);

  const resume = useCallback(() => {
    const at = Date.now();
    setNow(at);
    setSession((prev) => {
      if (prev === null) {
        return prev;
      }
      const configured = applySessionSettings(prev, durations, targetPomodoros);
      return { ...configured, timer: resumePhase(configured.timer, at) };
    });
  }, [durations, targetPomodoros]);

  const reset = useCallback(() => {
    const at = Date.now();
    setNow(at);
    setSession((prev) => {
      if (prev === null) {
        return prev;
      }
      const configured = applySessionSettings(
        prev,
        durations,
        targetPomodoros,
      );
      // Reiniciar la fase activa: no toca el contador de pomodoros.
      return configured.timer.status === 'ready'
        ? configured
        : {
            ...configured,
            timer: resetPhase(
              configured.timer,
              configured.timer.durationSeconds,
              at,
            ),
          };
    });
  }, [durations, targetPomodoros]);

  const skip = useCallback(() => {
    setNow(Date.now());
    setSession((prev) =>
      prev === null
        ? prev
        : skipPhase(applySessionSettings(prev, durations, targetPomodoros)),
    );
  }, [durations, targetPomodoros]);

  const endSession = useCallback(() => {
    setNow(Date.now());
    setSession((prev) => {
      if (prev === null) {
        return prev;
      }
      // Cierra la sesión terminada y deja un ciclo nuevo esperando Iniciar.
      return endSessionState(applySessionSettings(prev, durations, targetPomodoros));
    });
  }, [durations, targetPomodoros]);

  const clearPendingNotice = useCallback(() => {
    setPendingNotice(null);
  }, []);

  // Mientras se hidrata se muestran los valores por defecto sin parpadear
  // con datos vencidos; `ready` indica que ya se puede operar (RF-3).
  const effective: SessionState =
    effectiveSession ?? createSession(durations, targetPomodoros);

  return {
    phaseKind: effective.phaseKind,
    status: effective.timer.status,
    remainingSeconds:
      effectiveSession === null
        ? effective.timer.remainingSeconds
        : sessionRemaining(effectiveSession, now),
    completedPomodoros: effective.completedPomodoros,
    targetPomodoros: effective.targetPomodoros,
    sessionEnded: effective.sessionEnded,
    start,
    pause,
    resume,
    reset,
    skip,
    endSession,
    ready: session !== null,
    pendingNotice,
    clearPendingNotice,
  };
}

/** Utilidad para tests o usos fuera del hook: fase preparada. */
export { createReadyTimer, isDone };
