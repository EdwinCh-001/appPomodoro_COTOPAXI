import {
  type PhaseDurations,
  type SessionState,
  advancePhase,
  createSession,
  skipPhase,
} from '../session';
import { startPhase } from '../timer';
import { PHASE_LABELS, isBreak } from '../labels';

const DURATIONS: PhaseDurations = {
  study: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};
const TARGET = 4;
const NOW = 1_700_000_000_000;

/**
 * Recorre el ciclo completo igual que lo hará el hook: iniciar el
 * estudio, dejarlo terminar y aplicar la transición. Comprueba los
 * cuatro escenarios de HU-002.
 */
function completePhase(session: SessionState): SessionState {
  const enCurso = {
    ...session,
    timer: startPhase(session.timer.durationSeconds, NOW),
  };
  return advancePhase(enCurso, NOW);
}

describe('ciclo completo (escenarios de HU-002)', () => {
  it('alterna estudio → corto → estudio → corto → estudio → corto → estudio → largo y termina la sesión', () => {
    let session = createSession(DURATIONS, TARGET);
    const fases: string[] = [session.phaseKind];

    // Cuatro estudios completos con sus descansos.
    for (let i = 0; i < 4; i += 1) {
      session = completePhase(session);
      fases.push(session.phaseKind);
      // Enmienda 2026-10-20: cada fase del ciclo arranca sola (salvo el
      // cierre del ciclo, que deja la sesión terminada en 00:00).
      expect(session.timer.status).toBe('running');

      session = completePhase(session);
      fases.push(session.phaseKind);
    }

    expect(fases).toEqual([
      'study',
      'shortBreak',
      'study',
      'shortBreak',
      'study',
      'shortBreak',
      'study',
      'longBreak',
      // Enmienda fin de sesión: al terminar el descanso largo la fase
      // vencida se queda visible en 00:00 y la sesión queda terminada.
      'longBreak',
    ]);
    // RF-10/RF-2: el contador vuelve a cero y la sesión espera "Terminar sesión".
    expect(session.completedPomodoros).toBe(0);
    expect(session.sessionEnded).toBe(true);
    expect(session.timer.status).toBe('done');
    expect(session.timer.remainingSeconds).toBe(0);
  });

  it('muestra el avance correcto tras cada pomodoro (RF-8)', () => {
    let session = createSession(DURATIONS, TARGET);
    const avances: number[] = [];

    for (let i = 0; i < 3; i += 1) {
      session = completePhase(session);
      avances.push(session.completedPomodoros);
      session = completePhase(session);
    }

    expect(avances).toEqual([1, 2, 3]);
  });
});

describe('omitir descansos (RF-6, RF-7)', () => {
  it('omitir un descanso corto conserva los pomodoros y prepara el estudio', () => {
    const trasEstudio = completePhase(createSession(DURATIONS, TARGET));

    expect(trasEstudio.phaseKind).toBe('shortBreak');
    expect(trasEstudio.completedPomodoros).toBe(1);

    const omitido = skipPhase(trasEstudio);

    expect(omitido.phaseKind).toBe('study');
    expect(omitido.completedPomodoros).toBe(1);
    // Omitir es una acción del usuario: el estudio queda preparado.
    expect(omitido.timer.status).toBe('ready');
  });

  it('omitir el descanso largo deja el contador en cero y prepara un ciclo nuevo', () => {
    const conTres: SessionState = {
      ...createSession(DURATIONS, TARGET),
      completedPomodoros: 3,
    };
    const trasCuarto = completePhase(conTres);

    expect(trasCuarto.phaseKind).toBe('longBreak');
    expect(trasCuarto.completedPomodoros).toBe(0);

    const omitido = skipPhase(trasCuarto);

    expect(omitido.phaseKind).toBe('study');
    expect(omitido.completedPomodoros).toBe(0);
  });
});

describe('etiquetas de fase (RNF-2)', () => {
  it('nombra las fases en español', () => {
    expect(PHASE_LABELS.study).toBe('Estudio');
    expect(PHASE_LABELS.shortBreak).toBe('Descanso corto');
    expect(PHASE_LABELS.longBreak).toBe('Descanso largo');
  });

  it('considera descanso solo a los descansos', () => {
    expect(isBreak('study')).toBe(false);
    expect(isBreak('shortBreak')).toBe(true);
    expect(isBreak('longBreak')).toBe(true);
  });
});
