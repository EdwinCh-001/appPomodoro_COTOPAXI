/**
 * Sesión de ciclo — funciones puras (HU-002, RF-4 y RF-9).
 *
 * Combina el estado del temporizador (spec 001) con las reglas del
 * ciclo (`cycle.ts`) para calcular la fase siguiente. Sin React.
 */

import {
  type PhaseKind,
  canOmit,
  countPomodoro,
  nextPhase,
  resetCycle,
} from '@/domain/cycle';
import {
  type PhaseStatus,
  type TimerState,
  computeRemaining,
  isDone,
  startPhase,
} from '@/domain/timer';

/** Duración de cada tipo de fase, en segundos. La spec 005 la hará ajustable. */
export interface PhaseDurations {
  study: number;
  shortBreak: number;
  longBreak: number;
}

/**
 * Estado de la sesión: el timer de la fase activa más el contexto del
 * ciclo. El contador de pomodoros vive aquí y **no** dentro del timer,
 * de modo que `resetPhase` no puede tocarlo (RF-5).
 */
export interface SessionState {
  timer: TimerState;
  /** Fase activa (la que muestra el temporizador). */
  phaseKind: PhaseKind;
  /** Pomodoros completados en el ciclo actual. */
  completedPomodoros: number;
  /** Pomodoros necesarios para el descanso largo. */
  targetPomodoros: number;
  /** Duraciones configuradas por tipo de fase. */
  durations: PhaseDurations;
  /**
   * Ciclo completado: el descanso largo terminó y la sesión espera que el
   * usuario pulse "Terminar sesión" (enmienda fin de sesión 2026-10-20).
   * En este estado no hay ninguna fase corriendo.
   */
  sessionEnded: boolean;
}

/** Crea el estado inicial: ciclo en cero y estudio preparado (RF-4). */
export function createSession(
  durations: PhaseDurations,
  targetPomodoros: number,
): SessionState {
  return {
    timer: createReadyTimer(durations.study),
    phaseKind: 'study',
    completedPomodoros: 0,
    targetPomodoros,
    durations,
    sessionEnded: false,
  };
}

/**
 * Aplica los ajustes nuevos a la sesión (spec 005, corrección del
 * 2026-10-20).
 *
 * Guardar o restablecer ajustes **no reinicia el ciclo**. La sesión se
 * mantiene tal como está: la fase en curso conserva el tiempo con el que
 * empezó y su reloj (corriendo o pausada), el contador de pomodoros y el
 * progreso no se tocan. Lo único que cambia son las duraciones y el
 * objetivo almacenados en la sesión, de modo que **la fase siguiente**
 * —la que prepara `advancePhase`, que lee `durations[next]`— ya usa los
 * valores nuevos (RF-4 de la spec 002, sin cambios).
 *
 * Única excepción: una fase en estado `ready` (preparada, aún sin
 * iniciar) no tiene un tiempo "con el que empezó", así que su reloj
 * visible adopta la duración nueva para que el usuario vea lo que va a
 * arrancar.
 *
 * Si no cambia nada, la sesión se devuelve tal cual (identidad).
 */
export function applySessionSettings(
  session: SessionState,
  durations: PhaseDurations,
  targetPomodoros: number,
): SessionState {
  const durationsChanged =
    session.durations.study !== durations.study ||
    session.durations.shortBreak !== durations.shortBreak ||
    session.durations.longBreak !== durations.longBreak;
  const targetChanged = session.targetPomodoros !== targetPomodoros;

  if (!durationsChanged && !targetChanged) {
    return session;
  }

  // La fase lista aún no arrancó: su reloj visible pasa a la duración
  // nueva. Corriendo o pausada, el reloj se conserva intacto.
  const timer =
    session.timer.status === 'ready'
      ? createReadyTimer(durations[session.phaseKind])
      : session.timer;

  return { ...session, timer, durations, targetPomodoros };
}

/** Fase preparada: visible con su duración, esperando que la inicien. */
export function createReadyTimer(durationSeconds: number): TimerState {
  return {
    status: 'ready',
    durationSeconds,
    endAt: null,
    remainingSeconds: durationSeconds,
  };
}

/**
 * Aplica exactamente una transición de fin de fase: cuenta el pomodoro
 * si el estudio terminó, calcula la siguiente fase y la **inicia** con su
 * duración vigente (RF-4 enmendado el 2026-10-20, RF-9).
 *
 * Se llama solo cuando la fase activa ya llegó a cero, por lo que es
 * idempotente: aplicar la misma transición dos veces da el mismo
 * resultado (el estado deja de estar `done`).
 */
export function advancePhase(session: SessionState, now: number): SessionState {
  const { phaseKind, durations } = session;
  const wasStudy = phaseKind === 'study';

  // RF-10 (enmienda fin de sesión 2026-10-20): al terminar el descanso
  // largo, el ciclo se cierra. La pantalla NO se reinicia todavía: la fase
  // que venció se queda visible en 00:00 (`done`) y aparece "Terminar
  // sesión". Solo al pulsarlo se prepara la fase 1.
  if (phaseKind === 'longBreak') {
    return {
      ...session,
      timer: {
        status: 'done',
        durationSeconds: durations.longBreak,
        endAt: null,
        remainingSeconds: 0,
      },
      completedPomodoros: resetCycle(),
      sessionEnded: true,
    };
  }

  // RF-5: el contador solo sube al terminar un estudio completo.
  const completedPomodoros = wasStudy
    ? countPomodoro(session.completedPomodoros)
    : session.completedPomodoros;

  const next = nextPhase(completedPomodoros, session.targetPomodoros, phaseKind);

  // RF-2: al quedar listo el descanso largo, el contador vuelve a cero.
  const contadorFinal =
    next === 'longBreak' ? resetCycle() : completedPomodoros;

  return {
    ...session,
    // Enmienda 2026-10-20: la siguiente fase arranca sola.
    timer: startPhase(durations[next], now),
    phaseKind: next,
    completedPomodoros: contadorFinal,
    sessionEnded: false,
  };
}

/**
 * Cierra la sesión y prepara un ciclo nuevo desde cero (RF-11 de la
 * enmienda fin de sesión). El estudio queda preparado con la duración
 * vigente y **esperando que el usuario pulse Iniciar**.
 */
export function endSession(session: SessionState): SessionState {
  return createSession(session.durations, session.targetPomodoros);
}

/**
 * Omite la fase activa cuando el ciclo lo permite (RF-6, RF-7): el
 * descanso termina de inmediato y queda preparado el estudio. No cuenta
 * pomodoros ni altera el contador.
 *
 * Si la fase es de estudio, devuelve la sesión sin cambios.
 */
export function skipPhase(session: SessionState): SessionState {
  if (!canOmit(session.phaseKind)) {
    return session;
  }
  return {
    ...session,
    timer: createReadyTimer(session.durations.study),
    phaseKind: 'study',
  };
}

/**
 * Indica si la fase activa llegó a cero y toca aplicar la transición
 * (RF-9). No muta nada.
 */
export function shouldAdvance(session: SessionState, now: number): boolean {
  return isDone(session.timer, now);
}

/** Segundos restantes que debe mostrar la interfaz. */
export function sessionRemaining(session: SessionState, now: number): number {
  const { timer } = session;
  if (timer.status === 'running' && timer.endAt !== null) {
    return computeRemaining(timer.endAt, now);
  }
  return timer.remainingSeconds;
}

/** Estado de la fase activa, para las etiquetas de la interfaz. */
export function sessionStatus(session: SessionState): PhaseStatus {
  return session.timer.status;
}
