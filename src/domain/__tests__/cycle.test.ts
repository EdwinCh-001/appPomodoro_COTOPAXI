import {
  canOmit,
  countPomodoro,
  nextPhase,
  resetCycle,
} from '../cycle';
import { resetPhase, startPhase } from '../timer';

describe('nextPhase', () => {
  it('deja descanso corto al terminar un estudio con pomodoros 1, 2 o 3 (objetivo 4)', () => {
    expect(nextPhase(1, 4, 'study')).toBe('shortBreak');
    expect(nextPhase(2, 4, 'study')).toBe('shortBreak');
    expect(nextPhase(3, 4, 'study')).toBe('shortBreak');
  });

  it('deja descanso largo al completar el 4.º pomodoro del ciclo', () => {
    expect(nextPhase(4, 4, 'study')).toBe('longBreak');
  });

  it('deja estudio al terminar un descanso corto o largo', () => {
    expect(nextPhase(1, 4, 'shortBreak')).toBe('study');
    expect(nextPhase(0, 4, 'longBreak')).toBe('study');
  });

  it('con objetivo 1, todo estudio lleva directo a descanso largo', () => {
    expect(nextPhase(1, 1, 'study')).toBe('longBreak');
  });
});

describe('countPomodoro', () => {
  it('incrementa el contador en uno al terminar un estudio', () => {
    expect(countPomodoro(0)).toBe(1);
    expect(countPomodoro(2)).toBe(3);
  });
});

describe('resetCycle', () => {
  it('devuelve el contador del ciclo a cero', () => {
    expect(resetCycle()).toBe(0);
  });
});

describe('canOmit', () => {
  it('prohíbe omitir durante el estudio', () => {
    expect(canOmit('study')).toBe(false);
  });

  it('permite omitir en cualquier descanso', () => {
    expect(canOmit('shortBreak')).toBe(true);
    expect(canOmit('longBreak')).toBe(true);
  });
});

describe('integración con el temporizador (spec 001)', () => {
  it('omitir un descanso no altera el contador de pomodoros', () => {
    // Omitir = terminar el descanso sin pasar por countPomodoro. RF-6.
    const completados = 2;
    const siguiente = nextPhase(completados, 4, 'shortBreak');

    expect(siguiente).toBe('study');
    expect(completados).toBe(2);
  });

  it('reiniciar una fase no altera el contador de pomodoros', () => {
    // resetPhase (spec 001) no recibe el contador: sigue intacto. RF-5.
    const completados = 3;
    const trasReiniciar = resetPhase(
      startPhase(25 * 60, 1_700_000_000_000),
      25 * 60,
      1_700_000_000_000 + 60_000,
    );

    expect(completados).toBe(3);
    expect(trasReiniciar).not.toHaveProperty('completedPomodoros');
  });
});
