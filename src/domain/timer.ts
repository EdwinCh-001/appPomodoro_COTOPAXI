/**
 * Temporizador de fase — funciones puras (HU-001).
 *
 * Fuente de verdad: timestamps absolutos (epoch ms). El restante en
 * segundos se deriva siempre de `endAt - ahora`, nunca de un contador
 * decremental (Constitución #3 y #5; decisiones 001 #1 y #3).
 */

export type PhaseStatus = 'ready' | 'running' | 'paused' | 'done';

export interface TimerState {
  /** Estado de la fase. */
  status: PhaseStatus;
  /** Duración inicial de la fase en segundos (para reiniciar). */
  durationSeconds: number;
  /** Epoch ms en que termina la fase; solo mientras está en curso. */
  endAt: number | null;
  /** Segundos restantes exactos; congelado fuera de curso. */
  remainingSeconds: number;
}

/**
 * Crea una fase en curso con su fin calculado a partir de la duración.
 * RF-1: iniciar comienza la cuenta regresiva con la duración configurada.
 */
export function startPhase(durationSeconds: number, now: number): TimerState {
  return {
    status: 'running',
    durationSeconds,
    endAt: now + durationSeconds * 1000,
    remainingSeconds: durationSeconds,
  };
}

/**
 * Segundos restantes entre el fin y el instante dado, nunca negativos.
 * RNF-1: el cálculo se deriva de marcas de tiempo absolutas.
 */
export function computeRemaining(endAt: number, now: number): number {
  return Math.max(0, Math.round((endAt - now) / 1000));
}

/**
 * Pausa una fase en curso congelando el restante exacto (RF-3).
 * Una fase que no está en curso se devuelve sin cambios.
 */
export function pause(state: TimerState, now: number): TimerState {
  if (state.status !== 'running' || state.endAt === null) {
    return state;
  }
  return {
    ...state,
    status: 'paused',
    endAt: null,
    remainingSeconds: computeRemaining(state.endAt, now),
  };
}

/**
 * Reanuda una fase pausada desde el tiempo en que se pausó (RF-4).
 * Una fase que no está pausada se devuelve sin cambios.
 */
export function resume(state: TimerState, now: number): TimerState {
  if (state.status !== 'paused') {
    return state;
  }
  return {
    ...state,
    status: 'running',
    endAt: now + state.remainingSeconds * 1000,
  };
}

/**
 * Vuelve al tiempo inicial de la fase (RF-6). No recibe ni altera el
 * contador de pomodoros: su ausencia en la firma lo garantiza.
 */
export function resetPhase(
  state: TimerState,
  durationSeconds: number,
  now: number,
): TimerState {
  return {
    status: 'running',
    durationSeconds,
    endAt: now + durationSeconds * 1000,
    remainingSeconds: durationSeconds,
  };
}

/**
 * Indica si una fase en curso ya llegó a cero (RF-9).
 */
export function isDone(state: TimerState, now: number): boolean {
  return state.status === 'running' && state.endAt !== null && now >= state.endAt;
}
