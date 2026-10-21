import {
  type PhaseDurations,
  type SessionState,
  advancePhase,
  createSession,
  endSession,
  sessionRemaining,
  sessionStatus,
  shouldAdvance,
  skipPhase,
} from '../session';
import { pause, resume, startPhase } from '../timer';

const DURATIONS: PhaseDurations = {
  study: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};
const TARGET = 4;
const NOW = 1_700_000_000_000;

/** Sesión con el estudio ya en curso, para simular su fin. */
function runningStudy(session: SessionState, at: number): SessionState {
  return {
    ...session,
    timer: startPhase(session.durations.study, at),
  };
}

describe('createSession', () => {
  it('arranca con el ciclo en cero y el estudio preparado (no en curso)', () => {
    const session = createSession(DURATIONS, TARGET);

    expect(session.phaseKind).toBe('study');
    expect(session.completedPomodoros).toBe(0);
    expect(session.timer.status).toBe('ready');
    expect(session.timer.remainingSeconds).toBe(DURATIONS.study);
  });
});

describe('advancePhase', () => {
  it('al terminar el 1.er estudio inicia solo un descanso corto', () => {
    const session = advancePhase(
      runningStudy(createSession(DURATIONS, TARGET), NOW),
      NOW,
    );

    expect(session.phaseKind).toBe('shortBreak');
    expect(session.completedPomodoros).toBe(1);
    // Enmienda 2026-10-20: la siguiente fase arranca sola.
    expect(session.timer.status).toBe('running');
    expect(session.timer.remainingSeconds).toBe(DURATIONS.shortBreak);
    expect(session.timer.endAt).toBe(NOW + DURATIONS.shortBreak * 1000);
  });

  it('al terminar el 4.º estudio inicia descanso largo y pone el contador a cero', () => {
    const conTres: SessionState = {
      ...createSession(DURATIONS, TARGET),
      completedPomodoros: 3,
    };
    const session = advancePhase(runningStudy(conTres, NOW), NOW);

    expect(session.phaseKind).toBe('longBreak');
    expect(session.completedPomodoros).toBe(0);
    expect(session.timer.status).toBe('running');
    expect(session.timer.remainingSeconds).toBe(DURATIONS.longBreak);
  });

  it('al terminar un descanso inicia solo el siguiente estudio', () => {
    const enDescanso: SessionState = {
      ...createSession(DURATIONS, TARGET),
      phaseKind: 'shortBreak',
      completedPomodoros: 2,
      timer: startPhase(DURATIONS.shortBreak, NOW),
    };
    const session = advancePhase(enDescanso, NOW);

    expect(session.phaseKind).toBe('study');
    expect(session.timer.status).toBe('running');
    expect(session.timer.remainingSeconds).toBe(DURATIONS.study);
  });

  it('conserva el contador al terminar un descanso corto', () => {
    const enDescanso: SessionState = {
      ...createSession(DURATIONS, TARGET),
      phaseKind: 'shortBreak',
      completedPomodoros: 2,
      timer: startPhase(DURATIONS.shortBreak, NOW),
    };

    const session = advancePhase(enDescanso, NOW);

    expect(session.phaseKind).toBe('study');
    expect(session.completedPomodoros).toBe(2);
  });

  it('con objetivo 1, cada estudio lleva directo al descanso largo con el contador a cero', () => {
    const session = advancePhase(
      runningStudy(createSession(DURATIONS, 1), NOW),
      NOW,
    );

    expect(session.phaseKind).toBe('longBreak');
    expect(session.completedPomodoros).toBe(0);
  });
});

describe('fin de sesión al terminar el descanso largo (RF-10, RF-11)', () => {
  /** Descanso largo en curso, a punto de terminar. */
  function enDescansoLargo(): SessionState {
    return {
      ...createSession(DURATIONS, TARGET),
      phaseKind: 'longBreak',
      completedPomodoros: 0,
      timer: startPhase(DURATIONS.longBreak, NOW),
    };
  }

  it('al terminar el descanso largo marca la sesión como terminada en 00:00', () => {
    const session = advancePhase(enDescansoLargo(), NOW);

    expect(session.sessionEnded).toBe(true);
    // La pantalla no se reinicia: la fase vencida se queda visible en 00:00.
    expect(session.phaseKind).toBe('longBreak');
    expect(session.timer.status).toBe('done');
    expect(session.timer.remainingSeconds).toBe(0);
    expect(session.completedPomodoros).toBe(0);
  });

  it('no arranca solo un estudio nuevo tras el descanso largo', () => {
    const session = advancePhase(enDescansoLargo(), NOW);

    expect(session.timer.status).not.toBe('running');
    expect(session.timer.remainingSeconds).toBe(0);
  });

  it('endSession prepara la fase 1 desde cero esperando Iniciar', () => {
    const terminada = advancePhase(enDescansoLargo(), NOW);
    const nueva = endSession(terminada);

    expect(nueva.sessionEnded).toBe(false);
    expect(nueva.phaseKind).toBe('study');
    expect(nueva.timer.status).toBe('ready');
    expect(nueva.timer.remainingSeconds).toBe(DURATIONS.study);
    expect(nueva.completedPomodoros).toBe(0);
  });

  it('endSession conserva las duraciones y el objetivo definidos', () => {
    const conCinco = {
      ...createSession(DURATIONS, 5),
      phaseKind: 'longBreak' as const,
      completedPomodoros: 0,
      timer: startPhase(DURATIONS.longBreak, NOW),
    };
    const terminada = advancePhase(conCinco, NOW);
    const nueva = endSession(terminada);

    expect(nueva.durations).toEqual(DURATIONS);
    expect(nueva.targetPomodoros).toBe(5);
  });

  it('createSession nace sin la marca de sesión terminada', () => {
    expect(createSession(DURATIONS, TARGET).sessionEnded).toBe(false);
  });
});

describe('skipPhase', () => {
  it('omite un descanso y deja preparado el estudio sin tocar el contador (RF-6)', () => {
    const enDescanso: SessionState = {
      ...createSession(DURATIONS, TARGET),
      phaseKind: 'shortBreak',
      completedPomodoros: 2,
      timer: startPhase(DURATIONS.shortBreak, NOW),
    };
    const session = skipPhase(enDescanso);

    expect(session.phaseKind).toBe('study');
    expect(session.completedPomodoros).toBe(2);
    expect(session.timer.status).toBe('ready');
    expect(session.timer.remainingSeconds).toBe(DURATIONS.study);
  });

  it('no omite el estudio (RF-7)', () => {
    const session = runningStudy(createSession(DURATIONS, TARGET), NOW);

    expect(skipPhase(session)).toBe(session);
  });
});

describe('shouldAdvance y sessionRemaining', () => {
  it('detecta el fin de fase solo cuando el temporizador llegó a cero (RF-9)', () => {
    const session = runningStudy(createSession(DURATIONS, TARGET), NOW);

    expect(shouldAdvance(session, NOW)).toBe(false);
    expect(shouldAdvance(session, NOW + DURATIONS.study * 1000)).toBe(true);
  });

  it('devuelve el restante exacto y lo congela al pausar', () => {
    const session = runningStudy(createSession(DURATIONS, TARGET), NOW);
    const enPausa = { ...session, timer: pause(session.timer, NOW + 60_000) };

    expect(sessionRemaining(session, NOW + 60_000)).toBe(DURATIONS.study - 60);
    expect(sessionRemaining(enPausa, NOW + 600_000)).toBe(DURATIONS.study - 60);
  });

  it('sigue contando tras reanudar y no altera el contador', () => {
    const session = runningStudy(createSession(DURATIONS, TARGET), NOW);
    const reanudada = {
      ...session,
      timer: resume(pause(session.timer, NOW + 60_000), NOW + 300_000),
    };

    expect(sessionRemaining(reanudada, NOW + 360_000)).toBe(
      DURATIONS.study - 120,
    );
    expect(reanudada.completedPomodoros).toBe(0);
  });

  it('expone el estado de la fase para las etiquetas de la interfaz', () => {
    const session = createSession(DURATIONS, TARGET);

    expect(sessionStatus(session)).toBe('ready');
  });
});
