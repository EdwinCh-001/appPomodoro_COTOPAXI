import {
  startPhase,
  computeRemaining,
  pause,
  resume,
  resetPhase,
  isDone,
  type TimerState,
} from '../timer';

// Reloj fijo para todas las pruebas (epoch ms)
const NOW = 1_700_000_000_000;
const MINUTE = 60;

describe('startPhase', () => {
  it('crea la fase en curso con el fin calculado ahora + duración', () => {
    const state = startPhase(25 * MINUTE, NOW);

    expect(state.status).toBe('running');
    expect(state.endAt).toBe(NOW + 25 * MINUTE * 1000);
    expect(state.remainingSeconds).toBe(25 * MINUTE);
    expect(state.durationSeconds).toBe(25 * MINUTE);
  });
});

describe('computeRemaining', () => {
  it('devuelve el restante exacto en segundos antes del fin', () => {
    const endAt = NOW + 25 * MINUTE * 1000;

    expect(computeRemaining(endAt, NOW)).toBe(25 * MINUTE);
    expect(computeRemaining(endAt, NOW + 10 * MINUTE * 1000)).toBe(15 * MINUTE);
  });

  it('nunca devuelve un valor negativo pasado el fin', () => {
    const endAt = NOW + 25 * MINUTE * 1000;

    expect(computeRemaining(endAt, endAt)).toBe(0);
    expect(computeRemaining(endAt, endAt + 5 * MINUTE * 1000)).toBe(0);
  });
});

describe('pause', () => {
  it('congela el restante exacto en el momento de pausar', () => {
    const running = startPhase(25 * MINUTE, NOW);
    const paused = pause(running, NOW + 10 * MINUTE * 1000);

    expect(paused.status).toBe('paused');
    expect(paused.remainingSeconds).toBe(15 * MINUTE);
    expect(paused.endAt).toBeNull();
  });

  it('deja de contar mientras está pausada', () => {
    const paused = pause(startPhase(25 * MINUTE, NOW), NOW + 10 * MINUTE * 1000);

    // 10 minutos después sigue exactamente igual
    expect(computeRemainingFor(paused)).toBe(15 * MINUTE);
  });
});

describe('resume', () => {
  it('reanuda desde el tiempo en que se pausó, no desde el inicio', () => {
    const paused = pause(startPhase(25 * MINUTE, NOW), NOW + 10 * MINUTE * 1000);
    const reanudada = resume(paused, NOW + 30 * MINUTE * 1000);

    expect(reanudada.status).toBe('running');
    expect(reanudada.remainingSeconds).toBe(15 * MINUTE);
    expect(reanudada.endAt).toBe(NOW + 30 * MINUTE * 1000 + 15 * MINUTE * 1000);
  });

  it('sigue contando correctamente tras reanudar', () => {
    const paused = pause(startPhase(25 * MINUTE, NOW), NOW + 10 * MINUTE * 1000);
    const reanudada = resume(paused, NOW + 30 * MINUTE * 1000);

    expect(computeRemainingFor(reanudada)).toBeLessThanOrEqual(15 * MINUTE);
  });
});

describe('resetPhase', () => {
  it('vuelve al tiempo inicial de la fase', () => {
    const corriendo = startPhase(25 * MINUTE, NOW);
    const reiniciada = resetPhase(corriendo, 25 * MINUTE, NOW + 10 * MINUTE * 1000);

    expect(reiniciada.status).toBe('running');
    expect(reiniciada.remainingSeconds).toBe(25 * MINUTE);
    expect(reiniciada.endAt).toBe(NOW + 10 * MINUTE * 1000 + 25 * MINUTE * 1000);
  });

  it('reinicia también desde una fase pausada', () => {
    const paused = pause(startPhase(25 * MINUTE, NOW), NOW + 10 * MINUTE * 1000);
    const reiniciada = resetPhase(paused, 25 * MINUTE, NOW + 20 * MINUTE * 1000);

    expect(reiniciada.status).toBe('running');
    expect(reiniciada.remainingSeconds).toBe(25 * MINUTE);
  });

  it('no altera nada del estado fuera del tiempo de la fase (RF-6: el contador de pomodoros no se toca)', () => {
    const state = startPhase(25 * MINUTE, NOW);
    const reiniciada = resetPhase(state, 25 * MINUTE, NOW + MINUTE * 1000);

    // resetPhase no recibe pomodoros: el resto del estado queda idéntico
    expect(reiniciada).not.toHaveProperty('completedPomodoros');
    expect(Object.keys(reiniciada).sort()).toEqual(
      Object.keys(state).sort(),
    );
  });
});

describe('isDone', () => {
  it('detecta el cruce a cero', () => {
    const running = startPhase(25 * MINUTE, NOW);

    expect(isDone(running, NOW + 24 * MINUTE * 1000)).toBe(false);
    expect(isDone(running, NOW + 25 * MINUTE * 1000)).toBe(true);
    expect(isDone(running, NOW + 26 * MINUTE * 1000)).toBe(true);
  });
});

// Restante "tal y como lo vería la interfaz" para una fase en curso o pausada
function computeRemainingFor(state: TimerState): number {
  if (state.status === 'running' && state.endAt !== null) {
    return computeRemaining(state.endAt, Date.now());
  }
  return state.remainingSeconds;
}
