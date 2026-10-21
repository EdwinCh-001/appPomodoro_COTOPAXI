import {
  DEFAULT_DURATIONS,
  DEFAULT_TARGET_POMODOROS,
  type SessionSnapshot,
  reconcile,
} from '../reconcile';

/** Reloj fijo: 2026-01-01T00:00:00Z (epoch ms). */
const NOW = Date.UTC(2026, 0, 1);
const MINUTE_MS = 60_000;

/** Snapshot válido de estudio en curso, terminando en `endAt`. */
function runningSnapshot(endAt: number): SessionSnapshot {
  return {
    schemaVersion: 1,
    phaseKind: 'study',
    status: 'running',
    endAt,
    remainingSeconds: 25 * 60,
    completedPomodoros: 0,
    targetPomodoros: DEFAULT_TARGET_POMODOROS,
  };
}

describe('reconcile: sin datos', () => {
  it('arranca con los valores por defecto cuando no hay snapshot', () => {
    const { session, pendingNotice } = reconcile(null, NOW);

    expect(session.timer.status).toBe('ready');
    expect(session.phaseKind).toBe('study');
    expect(session.timer.remainingSeconds).toBe(DEFAULT_DURATIONS.study);
    expect(session.completedPomodoros).toBe(0);
    expect(pendingNotice).toBeNull();
  });
});

describe('reconcile: corriendo con fin futuro (bloqueo)', () => {
  it('descuenta el tiempo transcurrido y muestra el restante exacto', () => {
    // Fin dentro de 3 minutos → quedan 180 s.
    const { session, pendingNotice } = reconcile(
      runningSnapshot(NOW + 3 * MINUTE_MS),
      NOW,
    );

    expect(session.timer.status).toBe('running');
    expect(session.timer.remainingSeconds).toBe(3 * 60);
    expect(pendingNotice).toBeNull();
  });
});

describe('reconcile: corriendo con fin pasado (transición pendiente)', () => {
  it('aplica una sola transición, la inicia y deja aviso de fin pendiente', () => {
    const { session, pendingNotice } = reconcile(
      runningSnapshot(NOW - 5 * MINUTE_MS),
      NOW,
    );

    // RF-4 enmendado: siguiente fase en curso, contando desde `now`.
    expect(session.phaseKind).toBe('shortBreak');
    expect(session.timer.status).toBe('running');
    expect(session.timer.remainingSeconds).toBe(DEFAULT_DURATIONS.shortBreak);
    expect(session.timer.endAt).toBe(NOW + DEFAULT_DURATIONS.shortBreak * 1000);
    expect(pendingNotice).toEqual({ phaseKind: 'study' });
  });

  it('no encadena varias fases aunque hayan pasado horas', () => {
    const { session } = reconcile(
      runningSnapshot(NOW - 10 * 60 * MINUTE_MS),
      NOW,
    );

    // Una sola transición desde el estudio: descanso corto, no varias fases.
    expect(session.phaseKind).toBe('shortBreak');
    expect(session.completedPomodoros).toBe(1);
  });

  it('al terminar el 4.º estudio deja descanso largo y el contador a cero', () => {
    const snapshot = {
      ...runningSnapshot(NOW - MINUTE_MS),
      completedPomodoros: 3,
    };
    const { session, pendingNotice } = reconcile(snapshot, NOW);

    expect(session.phaseKind).toBe('longBreak');
    expect(session.completedPomodoros).toBe(0);
    expect(pendingNotice).toEqual({ phaseKind: 'study' });
  });
});

describe('reconcile: pausado', () => {
  it('conserva el restante exacto y no emite aviso (RF-5)', () => {
    const snapshot: SessionSnapshot = {
      schemaVersion: 1,
      phaseKind: 'study',
      status: 'paused',
      endAt: null,
      remainingSeconds: 7 * 60,
      completedPomodoros: 2,
      targetPomodoros: DEFAULT_TARGET_POMODOROS,
    };
    const { session, pendingNotice } = reconcile(snapshot, NOW + 60 * MINUTE_MS);

    expect(session.timer.status).toBe('paused');
    expect(session.timer.remainingSeconds).toBe(7 * 60);
    expect(session.completedPomodoros).toBe(2);
    expect(pendingNotice).toBeNull();
  });
});

describe('reconcile: versión desconocida', () => {
  it('degrada a los valores por defecto (RF-6, RF-8)', () => {
    const snapshot = { ...runningSnapshot(NOW + MINUTE_MS), schemaVersion: 99 };
    const { session, pendingNotice } = reconcile(snapshot, NOW);

    expect(session.timer.status).toBe('ready');
    expect(session.timer.remainingSeconds).toBe(DEFAULT_DURATIONS.study);
    expect(pendingNotice).toBeNull();
  });
});

describe('reconcile: conservación del contador', () => {
  it('mantiene los pomodoros completados de un descanso en curso', () => {
    const snapshot: SessionSnapshot = {
      schemaVersion: 1,
      phaseKind: 'shortBreak',
      status: 'running',
      endAt: NOW + 2 * MINUTE_MS,
      remainingSeconds: 5 * 60,
      completedPomodoros: 2,
      targetPomodoros: DEFAULT_TARGET_POMODOROS,
    };
    const { session } = reconcile(snapshot, NOW);

    expect(session.phaseKind).toBe('shortBreak');
    expect(session.completedPomodoros).toBe(2);
    expect(session.timer.remainingSeconds).toBe(2 * 60);
  });
});

describe('reconcile: sesión terminada (RF-9 de la spec 003)', () => {
  it('restaura la sesión terminada en 00:00 y espera "Terminar sesión"', () => {
    const snapshot: SessionSnapshot = {
      schemaVersion: 1,
      phaseKind: 'longBreak',
      status: 'done',
      endAt: null,
      remainingSeconds: 0,
      completedPomodoros: 0,
      targetPomodoros: DEFAULT_TARGET_POMODOROS,
      sessionEnded: true,
    };
    const { session, pendingNotice } = reconcile(snapshot, NOW + 60 * MINUTE_MS);

    expect(session.sessionEnded).toBe(true);
    expect(session.phaseKind).toBe('longBreak');
    expect(session.timer.status).toBe('done');
    expect(session.timer.remainingSeconds).toBe(0);
    expect(session.completedPomodoros).toBe(0);
    expect(pendingNotice).toBeNull();
  });

  it('un snapshot antiguo sin el campo no queda terminado (compatible)', () => {
    const { session } = reconcile(runningSnapshot(NOW + MINUTE_MS), NOW);

    expect(session.sessionEnded).toBe(false);
  });

  it('si vence el descanso largo con la app cerrada, la sesión queda terminada en 00:00', () => {
    const snapshot: SessionSnapshot = {
      schemaVersion: 1,
      phaseKind: 'longBreak',
      status: 'running',
      endAt: NOW - MINUTE_MS,
      remainingSeconds: 15 * 60,
      completedPomodoros: 0,
      targetPomodoros: DEFAULT_TARGET_POMODOROS,
    };
    const { session, pendingNotice } = reconcile(snapshot, NOW);

    expect(session.sessionEnded).toBe(true);
    expect(session.phaseKind).toBe('longBreak');
    expect(session.timer.status).toBe('done');
    expect(session.timer.remainingSeconds).toBe(0);
    expect(pendingNotice).toEqual({ phaseKind: 'longBreak' });
  });
});
