/**
 * Pruebas de la aplicación de ajustes a la sesión.
 *
 * Enmienda 2026-10-20 (corrección de la enmienda anterior, spec 005): al
 * cambiar cualquier ajuste la sesión **no se reinicia**. La fase en curso
 * conserva el tiempo con el que empezó y su reloj; el contador y el
 * progreso se mantienen. Los ajustes nuevos rigen a partir de la fase
 * siguiente (`advancePhase` lee `durations[next]`). Todo con funciones
 * puras, sin dispositivo.
 */

import { settingsToDurations } from '../settings';
import {
  applySessionSettings,
  createSession,
  advancePhase,
} from '../session';
import { startPhase, pause as pausePhase } from '../timer';

const TARGET = 4;

/** Ajustes por defecto en el formato que consume el dominio. */
const DEFAULT_DURATIONS = settingsToDurations({
  studyMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  pomodorosPerCycle: 4,
});

const DIECES = settingsToDurations({
  studyMinutes: 10,
  shortBreakMinutes: 8,
  longBreakMinutes: 20,
  pomodorosPerCycle: 4,
});

describe('settingsToDurations', () => {
  it('convierte minutos a segundos', () => {
    const durations = settingsToDurations({
      studyMinutes: 10,
      shortBreakMinutes: 3,
      longBreakMinutes: 20,
      pomodorosPerCycle: 2,
    });

    expect(durations).toEqual({ study: 600, shortBreak: 180, longBreak: 1200 });
  });
});

describe('guardar ajustes NO reinicia el ciclo (spec 005 corregida)', () => {
  it('una fase en curso conserva su tiempo y su reloj', () => {
    const session = createSession(DEFAULT_DURATIONS, TARGET);
    const running = {
      ...session,
      timer: startPhase(DEFAULT_DURATIONS.study, 0),
    };

    const configurada = applySessionSettings(running, DIECES, TARGET);

    // La fase en curso no cambia: sigue corriendo con los 25 min originales.
    expect(configurada.phaseKind).toBe('study');
    expect(configurada.timer.status).toBe('running');
    expect(configurada.timer.durationSeconds).toBe(25 * 60);
    expect(configurada.timer.endAt).toBe(running.timer.endAt);
    expect(configurada.timer.remainingSeconds).toBe(25 * 60);
  });

  it('una fase pausada conserva su tiempo restante', () => {
    const session = createSession(DEFAULT_DURATIONS, TARGET);
    const enCurso = { ...session, timer: startPhase(DEFAULT_DURATIONS.study, 0) };
    const pausada = { ...enCurso, timer: pausePhase(enCurso.timer, 5_000) };

    const configurada = applySessionSettings(pausada, DIECES, TARGET);

    expect(configurada.timer.status).toBe('paused');
    expect(configurada.timer.durationSeconds).toBe(25 * 60);
    expect(configurada.timer.remainingSeconds).toBe(pausada.timer.remainingSeconds);
  });

  it('mantiene el contador de pomodoros', () => {
    const session = createSession(DEFAULT_DURATIONS, TARGET);
    const conDos = {
      ...session,
      completedPomodoros: 2,
      phaseKind: 'study' as const,
      timer: startPhase(DEFAULT_DURATIONS.study, 0),
    };

    const configurada = applySessionSettings(conDos, DIECES, TARGET);

    expect(configurada.completedPomodoros).toBe(2);
    expect(configurada.phaseKind).toBe('study');
  });

  it('no cambia de fase aunque se guarde durante un descanso', () => {
    const session = createSession(DEFAULT_DURATIONS, TARGET);
    const enDescanso = {
      ...session,
      completedPomodoros: 1,
      phaseKind: 'shortBreak' as const,
      timer: startPhase(DEFAULT_DURATIONS.shortBreak, 0),
    };

    const configurada = applySessionSettings(enDescanso, DIECES, TARGET);

    expect(configurada.phaseKind).toBe('shortBreak');
    expect(configurada.timer.status).toBe('running');
    expect(configurada.timer.durationSeconds).toBe(5 * 60);
    expect(configurada.completedPomodoros).toBe(1);
  });

  it('adopta las duraciones nuevas para la fase siguiente', () => {
    const session = createSession(DEFAULT_DURATIONS, TARGET);
    const running = {
      ...session,
      timer: startPhase(DEFAULT_DURATIONS.study, 0),
    };

    // El usuario cambia a 10/8/20 mientras el estudio de 25 min corre.
    const configurada = applySessionSettings(running, DIECES, TARGET);
    expect(configurada.durations).toEqual(DIECES);

    // El estudio en curso termina con su tiempo original…
    const terminado = {
      ...configurada,
      timer: { ...configurada.timer, status: 'done' as const, endAt: null, remainingSeconds: 0 },
    };
    const siguiente = advancePhase(terminado, 0);

    // …y el descanso siguiente ya usa la duración nueva (8 min).
    expect(siguiente.phaseKind).toBe('shortBreak');
    expect(siguiente.timer.durationSeconds).toBe(8 * 60);
  });

  it('una fase lista (sin iniciar) sí muestra la duración nueva', () => {
    const session = createSession(DEFAULT_DURATIONS, TARGET);

    const configurada = applySessionSettings(session, DIECES, TARGET);

    // No hay tiempo "con el que empezó": el reloj visible pasa al nuevo.
    expect(configurada.timer.status).toBe('ready');
    expect(configurada.timer.durationSeconds).toBe(10 * 60);
    expect(configurada.timer.remainingSeconds).toBe(10 * 60);
  });

  it('no toca nada si los ajustes no cambian', () => {
    const session = createSession(DEFAULT_DURATIONS, TARGET);
    const running = {
      ...session,
      completedPomodoros: 1,
      timer: startPhase(DEFAULT_DURATIONS.study, 0),
    };

    const configurada = applySessionSettings(running, DEFAULT_DURATIONS, TARGET);

    expect(configurada).toBe(running);
    expect(configurada.timer.status).toBe('running');
  });
});

describe('cantidad de pomodoros del ciclo se aplica de inmediato', () => {
  it('adopta el objetivo nuevo sin tocar el contador', () => {
    const session = createSession(DEFAULT_DURATIONS, TARGET);
    const aMedias = {
      ...session,
      completedPomodoros: 2,
      phaseKind: 'shortBreak' as const,
      timer: startPhase(DEFAULT_DURATIONS.shortBreak, 0),
    };

    const configurada = applySessionSettings(aMedias, DEFAULT_DURATIONS, 6);

    expect(configurada.targetPomodoros).toBe(6);
    expect(configurada.completedPomodoros).toBe(2);
    expect(configurada.phaseKind).toBe('shortBreak');
    expect(configurada.timer.status).toBe('running');
  });

  it('el objetivo nuevo rige la transición desde ese momento', () => {
    const session = createSession(DEFAULT_DURATIONS, TARGET);
    const conUno = {
      ...session,
      completedPomodoros: 1,
      timer: startPhase(DEFAULT_DURATIONS.study, 0),
    };

    // El usuario baja el objetivo a 2 con 1 pomodoro ya hecho.
    const configurada = applySessionSettings(conUno, DEFAULT_DURATIONS, 2);
    expect(configurada.completedPomodoros).toBe(1);

    // El estudio en curso termina: 1 → 2 cierra el ciclo, con descanso largo.
    const terminado = {
      ...configurada,
      timer: { ...configurada.timer, status: 'done' as const, endAt: null, remainingSeconds: 0 },
    };
    const siguiente = advancePhase(terminado, 0);
    expect(siguiente.phaseKind).toBe('longBreak');
    expect(siguiente.completedPomodoros).toBe(0);
  });
});

describe('restablecer se comporta como guardar', () => {
  it('volver a los defaults conserva el progreso y aplica lo nuevo', () => {
    const enCursoConDiez = {
      ...createSession(DIECES, TARGET),
      completedPomodoros: 2,
      phaseKind: 'study' as const,
      timer: startPhase(DIECES.study, 0),
    };

    const configurada = applySessionSettings(
      enCursoConDiez,
      DEFAULT_DURATIONS,
      TARGET,
    );

    expect(configurada.timer.status).toBe('running');
    expect(configurada.timer.durationSeconds).toBe(10 * 60);
    expect(configurada.completedPomodoros).toBe(2);
    expect(configurada.phaseKind).toBe('study');
  });
});

describe('avance automático del ciclo (spec 002 RF-4)', () => {
  it('encadena estudio → descanso corto → estudio con las duraciones vigentes', () => {
    const session = createSession(DIECES, TARGET);
    const primerEstudio = {
      ...session,
      timer: { ...startPhase(DIECES.study, 0), status: 'done' as const, endAt: null, remainingSeconds: 0 },
    };

    const descanso = advancePhase(primerEstudio, 0);
    expect(descanso.phaseKind).toBe('shortBreak');
    expect(descanso.timer.status).toBe('running');
    expect(descanso.timer.durationSeconds).toBe(DIECES.shortBreak);

    const segundoEstudio = advancePhase(descanso, DIECES.shortBreak * 1000);
    expect(segundoEstudio.phaseKind).toBe('study');
    expect(segundoEstudio.timer.status).toBe('running');
    expect(segundoEstudio.timer.durationSeconds).toBe(DIECES.study);
  });

  it('tras completar el objetivo llega al descanso largo y reinicia el contador', () => {
    const session = createSession(DIECES, 2);
    const segundoEstudio = {
      ...session,
      completedPomodoros: 1,
      timer: { ...startPhase(DIECES.study, 0), status: 'done' as const, endAt: null, remainingSeconds: 0 },
    };

    const descanso = advancePhase(segundoEstudio, 0);

    expect(descanso.phaseKind).toBe('longBreak');
    expect(descanso.completedPomodoros).toBe(0);
    expect(descanso.timer.status).toBe('running');
    expect(descanso.timer.durationSeconds).toBe(DIECES.longBreak);
  });
});
