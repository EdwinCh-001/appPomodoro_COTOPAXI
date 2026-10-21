/**
 * Pruebas de integración del arranque persistente (spec 003, HU-003).
 *
 * Simulan lo que ocurre entre dos aperturas de la app sin montar React:
 * guardar un snapshot → cargarlo → reconciliarlo. Es el flujo de riesgo
 * alto de la HU-003, por lo que se prueba de forma explícita.
 */

import {
  DEFAULT_TARGET_POMODOROS,
  type SessionSnapshot,
  reconcile,
  toSnapshot,
} from '../reconcile';
import { advancePhase, createSession } from '../session';
import { startPhase } from '../timer';

/** Reloj fijo. */
const BASE = Date.UTC(2026, 0, 1, 12);
const MINUTE = 60_000;

/** Sesión de estudio en curso que empezó en `at`. */
function sessionRunningStudy(at: number) {
  const base = createSession(
    { study: 25 * 60, shortBreak: 5 * 60, longBreak: 15 * 60 },
    DEFAULT_TARGET_POMODOROS,
  );
  return { ...base, timer: startPhase(base.durations.study, at) };
}

describe('ida y vuelta snapshot → reconciliación', () => {
  it('un estudio en curso con fin futuro conserva el restante exacto', () => {
    const session = sessionRunningStudy(BASE);
    const snapshot = toSnapshot(session);

    // La app se reabre 10 minutos después.
    const { session: restored, pendingNotice } = reconcile(
      snapshot,
      BASE + 10 * MINUTE,
    );

    expect(restored.timer.status).toBe('running');
    expect(restored.timer.remainingSeconds).toBe(15 * 60);
    expect(restored.timer.endAt).toBe(session.timer.endAt);
    expect(pendingNotice).toBeNull();
  });

  it('un estudio vencido con la app cerrada deja aviso y arranca la siguiente fase', () => {
    const session = sessionRunningStudy(BASE);
    const snapshot = toSnapshot(session);

    // Se reabre 30 minutos después: venció hace 5.
    const { session: restored, pendingNotice } = reconcile(
      snapshot,
      BASE + 30 * MINUTE,
    );

    expect(restored.phaseKind).toBe('shortBreak');
    // Enmienda 2026-10-20: arranca sola, con su tiempo completo.
    expect(restored.timer.status).toBe('running');
    expect(restored.timer.remainingSeconds).toBe(5 * 60);
    expect(restored.timer.endAt).toBe(BASE + 30 * MINUTE + 5 * 60 * 1000);
    expect(restored.completedPomodoros).toBe(1);
    // El aviso identifica la fase que terminó (para la spec 004).
    expect(pendingNotice).toEqual({ phaseKind: 'study' });
  });

  it('el snapshot guardado tras una transición es el que se restaura', () => {
    const running = sessionRunningStudy(BASE);
    const advanced = advancePhase(
      {
        ...running,
        timer: {
          ...running.timer,
          status: 'done',
          endAt: null,
          remainingSeconds: 0,
        },
      },
      BASE + 25 * MINUTE,
    );
    const snapshot = toSnapshot(advanced);

    // Se reabre un minuto después de arrancar el descanso: sigue corriendo.
    const { session: restored } = reconcile(snapshot, BASE + 26 * MINUTE);

    expect(restored.phaseKind).toBe('shortBreak');
    expect(restored.completedPomodoros).toBe(1);
    expect(restored.timer.status).toBe('running');
    expect(restored.timer.remainingSeconds).toBe(4 * 60);
  });

  it('una sesión pausada se restaura idéntica y sin aviso, aunque pasen horas', () => {
    const session = sessionRunningStudy(BASE + 10 * MINUTE);
    const pausada = {
      ...session,
      timer: {
        status: 'paused' as const,
        durationSeconds: session.timer.durationSeconds,
        endAt: null,
        remainingSeconds: 12 * 60,
      },
    };
    const snapshot = toSnapshot(pausada);

    const { session: restored, pendingNotice } = reconcile(
      snapshot,
      BASE + 8 * 60 * MINUTE,
    );

    expect(restored.timer.status).toBe('paused');
    expect(restored.timer.remainingSeconds).toBe(12 * 60);
    expect(pendingNotice).toBeNull();
  });

  it('un snapshot de versión desconocida se descarta y arranca limpio', () => {
    const snapshot: SessionSnapshot = {
      ...toSnapshot(sessionRunningStudy(BASE)),
      schemaVersion: 42,
    };

    const { session: restored, pendingNotice } = reconcile(
      snapshot,
      BASE + MINUTE,
    );

    expect(restored.timer.status).toBe('ready');
    expect(restored.phaseKind).toBe('study');
    expect(pendingNotice).toBeNull();
  });

  it('la sesión terminada sobrevive al cierre y se restaura esperando "Terminar sesión"', () => {
    // Ciclo completo: el descanso largo termina y la sesión se cierra.
    const base = createSession(
      { study: 25 * 60, shortBreak: 5 * 60, longBreak: 15 * 60 },
      DEFAULT_TARGET_POMODOROS,
    );
    const enDescansoLargo = {
      ...base,
      phaseKind: 'longBreak' as const,
      completedPomodoros: 0,
      timer: { ...startPhase(base.durations.longBreak, BASE), status: 'done' as const, endAt: null, remainingSeconds: 0 },
    };
    const terminada = advancePhase(enDescansoLargo, BASE);
    const snapshot = toSnapshot(terminada);

    expect(snapshot.sessionEnded).toBe(true);

    // Se reabre horas después: sigue esperando "Terminar sesión" en 00:00.
    const { session: restored } = reconcile(snapshot, BASE + 8 * 60 * MINUTE);

    expect(restored.sessionEnded).toBe(true);
    expect(restored.phaseKind).toBe('longBreak');
    expect(restored.timer.status).toBe('done');
    expect(restored.timer.remainingSeconds).toBe(0);
    expect(restored.completedPomodoros).toBe(0);
  });
});
