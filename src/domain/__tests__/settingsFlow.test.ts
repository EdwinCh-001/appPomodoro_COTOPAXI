/**
 * Pruebas del flujo de ajustes → sesión (spec 005, corregida 2026-10-20).
 *
 * Propiedad clave: al guardar o restablecer ajustes la sesión **se mantiene**
 * (fase en curso, reloj y contador intactos) y los ajustes nuevos rigen a
 * partir de la fase siguiente. Todo con funciones puras, sin dispositivo.
 */

import { settingsToDurations } from '../settings';
import {
  applySessionSettings,
  createSession,
  advancePhase,
} from '../session';
import { startPhase } from '../timer';

const TARGET = 4;

/** Ajustes por defecto en el formato que consume el dominio. */
const DEFAULT_DURATIONS = settingsToDurations({
  studyMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
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

describe('duración al cambiar los ajustes (spec 005 corregida)', () => {
  it('la fase en curso conserva el tiempo con el que empezó', () => {
    const session = createSession(DEFAULT_DURATIONS, TARGET);
    // El estudio arranca con 25 min.
    const running = { ...session, timer: startPhase(DEFAULT_DURATIONS.study, 0) };

    // El usuario cambia los ajustes a 10 min mientras corre.
    const nuevos = settingsToDurations({
      studyMinutes: 10,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
      pomodorosPerCycle: 4,
    });

    const configurada = applySessionSettings(running, nuevos, TARGET);

    // La fase sigue corriendo con sus 25 min originales.
    expect(configurada.phaseKind).toBe('study');
    expect(configurada.timer.status).toBe('running');
    expect(configurada.timer.durationSeconds).toBe(25 * 60);
    expect(configurada.timer.endAt).toBe(running.timer.endAt);
    expect(configurada.completedPomodoros).toBe(0);
  });

  it('actualiza los ajustes internos antes de iniciar una fase lista', () => {
    const session = createSession(DEFAULT_DURATIONS, TARGET);
    const nuevos = settingsToDurations({
      studyMinutes: 10,
      shortBreakMinutes: 8,
      longBreakMinutes: 20,
      pomodorosPerCycle: 2,
    });

    const configurada = applySessionSettings(session, nuevos, 2);

    expect(configurada.durations).toEqual(nuevos);
    expect(configurada.targetPomodoros).toBe(2);
    // Fase lista sin iniciar: su reloj visible adopta la duración nueva.
    expect(configurada.timer.durationSeconds).toBe(10 * 60);
    expect(configurada.timer.remainingSeconds).toBe(10 * 60);
    expect(configurada.completedPomodoros).toBe(0);
  });

  it('mantiene el contador y aplica el objetivo nuevo al avanzar', () => {
    const session = createSession(DEFAULT_DURATIONS, TARGET);
    const running = {
      ...session,
      completedPomodoros: 1,
      timer: startPhase(DEFAULT_DURATIONS.study, 0),
    };
    const nuevos = settingsToDurations({
      studyMinutes: 10,
      shortBreakMinutes: 8,
      longBreakMinutes: 20,
      pomodorosPerCycle: 2,
    });

    const configurada = applySessionSettings(running, nuevos, 2);

    // El contador no se toca.
    expect(configurada.completedPomodoros).toBe(1);
    expect(configurada.targetPomodoros).toBe(2);

    // El estudio en curso termina: 1 → 2 cierra el ciclo con descanso largo.
    const terminado = {
      ...configurada,
      timer: { ...configurada.timer, status: 'done' as const, endAt: null, remainingSeconds: 0 },
    };
    const siguiente = advancePhase(terminado, 0);
    expect(siguiente.phaseKind).toBe('longBreak');
    expect(siguiente.completedPomodoros).toBe(0);
  });

  it('la siguiente fase usa los ajustes nuevos tras terminar el estudio', () => {
    const session = createSession(DEFAULT_DURATIONS, TARGET);
    const running = {
      ...session,
      timer: { ...startPhase(DEFAULT_DURATIONS.study, 0), status: 'done' as const },
      // La sesión adopta las duraciones nuevas al preparar la siguiente fase.
      durations: settingsToDurations({
        studyMinutes: 10,
        shortBreakMinutes: 8,
        longBreakMinutes: 15,
        pomodorosPerCycle: 4,
      }),
    };
    const siguiente = advancePhase(running, 0);

    expect(siguiente.phaseKind).toBe('shortBreak');
    expect(siguiente.timer.durationSeconds).toBe(8 * 60);
    expect(siguiente.timer.remainingSeconds).toBe(8 * 60);
  });
});

describe('restablecer no reinicia el ciclo (spec 005 corregida)', () => {
  it('volver a los defaults conserva el progreso', () => {
    const enCursoConDiez = {
      ...createSession(
        settingsToDurations({
          studyMinutes: 10,
          shortBreakMinutes: 8,
          longBreakMinutes: 20,
          pomodorosPerCycle: 4,
        }),
        TARGET,
      ),
      completedPomodoros: 2,
      timer: startPhase(600, 0),
    };

    const configurada = applySessionSettings(
      enCursoConDiez,
      DEFAULT_DURATIONS,
      TARGET,
    );

    expect(configurada.completedPomodoros).toBe(2);
    expect(configurada.phaseKind).toBe('study');
    expect(configurada.timer.status).toBe('running');
    expect(configurada.timer.durationSeconds).toBe(10 * 60);
  });
});

describe('objetivo de pomodoros del ciclo', () => {
  it('el objetivo nuevo aplica al calcular la fase siguiente', () => {
    const session = createSession(DEFAULT_DURATIONS, 2);
    const running = {
      ...session,
      completedPomodoros: 1,
      timer: { ...startPhase(DEFAULT_DURATIONS.study, 0), status: 'done' as const },
    };

    // Con objetivo 2, el 2.º estudio completado lleva directo a descanso largo.
    const siguiente = advancePhase(running, 0);

    expect(siguiente.phaseKind).toBe('longBreak');
    expect(siguiente.completedPomodoros).toBe(0);
  });
});
