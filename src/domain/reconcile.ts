/**
 * Reconciliación de la sesión — función pura (HU-003).
 *
 * Compara el snapshot guardado con el instante actual y devuelve la
 * sesión que corresponde mostrar. Es el corazón de alto riesgo de la
 * spec 003, por eso vive fuera de React y se prueba sin dispositivo
 * (Constitución #5 y #6; decisiones 003 #3).
 */

import type { PhaseKind } from '@/domain/cycle';
import {
  type PhaseDurations,
  type SessionState,
  advancePhase,
  createReadyTimer,
  createSession,
} from '@/domain/session';
import type { PhaseStatus } from '@/domain/timer';

/**
 * Versión del formato persistido. Una versión distinta se descarta y se
 * arranca con los valores por defecto (RF-8; decisiones 003 #7).
 */
export const SNAPSHOT_SCHEMA_VERSION = 1;

/** Duraciones por defecto: 25/5/15 (skill `pomodoro-rules`). */
export const DEFAULT_DURATIONS: PhaseDurations = {
  study: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

/** Pomodoros necesarios para el descanso largo por defecto. */
export const DEFAULT_TARGET_POMODOROS = 4;

/** Datos tal y como se guardan en el dispositivo (RF-1, RF-8). */
export interface SessionSnapshot {
  schemaVersion: number;
  phaseKind: PhaseKind;
  status: PhaseStatus;
  /** Epoch ms de fin de fase; `null` si está pausada o lista. */
  endAt: number | null;
  /** Segundos restantes; exactos al pausar, coherentes si está lista. */
  remainingSeconds: number;
  completedPomodoros: number;
  targetPomodoros: number;
  /**
   * Ciclo completado esperando "Terminar sesión" (enmienda fin de sesión
   * 2026-10-20). Campo añadido; un snapshot antiguo sin él se interpreta
   * como `false` (RF-9 de la spec 003).
   */
  sessionEnded?: boolean;
}

/** Aviso de fin de fase ocurrido con la app cerrada (para la spec 004). */
export interface PendingNotice {
  /** Fase que terminó mientras la app no estaba en uso. */
  phaseKind: PhaseKind;
}

export interface ReconcileResult {
  /** Sesión lista para renderizar. */
  session: SessionState;
  /** Aviso pendiente de entregar, o `null` si no hay ninguno. */
  pendingNotice: PendingNotice | null;
}

/** Sesión limpia con los valores por defecto (RF-6). */
function defaultSession(): SessionState {
  return createSession(DEFAULT_DURATIONS, DEFAULT_TARGET_POMODOROS);
}

/**
 * Reconcilia el snapshot guardado con el momento actual (RF-2..RF-5).
 *
 * - `null` o versión desconocida → valores por defecto, sin aviso.
 * - `running` con fin futuro → restante derivado del timestamp (RNF-1).
 * - `running` con fin pasado → **una sola** transición pendiente y su
 *   aviso (no se encadenan fases; caso límite de la especificación).
 * - `paused` → restante exacto conservado y sin aviso (RF-5).
 * - sesión terminada (`sessionEnded`) → se restaura esperando "Terminar
 *   sesión" (RF-9 de la spec 003).
 */
export function reconcile(
  snapshot: SessionSnapshot | null,
  now: number,
): ReconcileResult {
  if (snapshot === null || snapshot.schemaVersion !== SNAPSHOT_SCHEMA_VERSION) {
    return { session: defaultSession(), pendingNotice: null };
  }

  const base: SessionState = createSession(
    DEFAULT_DURATIONS,
    snapshot.targetPomodoros,
  );
  const durations = base.durations;

  const conContexto: SessionState = {
    ...base,
    phaseKind: snapshot.phaseKind,
    completedPomodoros: snapshot.completedPomodoros,
    sessionEnded: snapshot.sessionEnded === true,
  };

  // RF-9 de la spec 003 (enmienda fin de sesión): sesión terminada
  // guardada; se restaura tal cual, en 00:00, esperando "Terminar sesión".
  if (conContexto.sessionEnded) {
    return {
      session: {
        ...conContexto,
        timer: {
          status: 'done',
          durationSeconds: durations[snapshot.phaseKind],
          endAt: null,
          remainingSeconds: 0,
        },
      },
      pendingNotice: null,
    };
  }

  if (snapshot.status === 'paused') {
    // RF-5: congelado tal cual se guardó, sin aviso.
    return {
      session: {
        ...conContexto,
        timer: {
          status: 'paused',
          durationSeconds: durations[snapshot.phaseKind],
          endAt: null,
          remainingSeconds: snapshot.remainingSeconds,
        },
      },
      pendingNotice: null,
    };
  }

  if (snapshot.status === 'running' && snapshot.endAt !== null) {
    if (now < snapshot.endAt) {
      // RF-2: sigue corriendo; el restante sale del timestamp (RNF-1).
      const remainingSeconds = Math.max(
        0,
        Math.round((snapshot.endAt - now) / 1000),
      );
      return {
        session: {
          ...conContexto,
          timer: {
            status: 'running',
            durationSeconds: durations[snapshot.phaseKind],
            endAt: snapshot.endAt,
            remainingSeconds,
          },
        },
        pendingNotice: null,
      };
    }

    // RF-4 (enmendado 2026-10-20): venció mientras la app no estaba; una
    // sola transición y la siguiente fase arranca sola, con su tiempo
    // completo contando desde `now`.
    return {
      session: advancePhase(conContexto, now),
      pendingNotice: { phaseKind: snapshot.phaseKind },
    };
  }

  // Fase preparada (lista) guardada: se restaura tal cual.
  return {
    session: {
      ...conContexto,
      timer: createReadyTimer(durations[snapshot.phaseKind]),
    },
    pendingNotice: null,
  };
}

/** Convierte una sesión al formato persistido (RF-1). */
export function toSnapshot(session: SessionState): SessionSnapshot {
  return {
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
    phaseKind: session.phaseKind,
    status: session.timer.status,
    endAt: session.timer.endAt,
    remainingSeconds: session.timer.remainingSeconds,
    completedPomodoros: session.completedPomodoros,
    targetPomodoros: session.targetPomodoros,
    sessionEnded: session.sessionEnded,
  };
}
