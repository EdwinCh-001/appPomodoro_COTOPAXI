/**
 * Ciclos Pomodoro — funciones puras (HU-002).
 *
 * Reglas de transición entre estudio y descanso, conteo de pomodoros y
 * omisión de descansos. Sin React ni AsyncStorage (Constitución #5).
 * Fuente de verdad de las reglas: skill `pomodoro-rules`.
 */

/** Tipo de fase del ciclo. */
export type PhaseKind = 'study' | 'shortBreak' | 'longBreak';

/**
 * Fase que sigue, según el ciclo (RF-1, RF-2, RF-3).
 *
 * - Tras un estudio: descanso largo si ya se completó el objetivo del
 *   ciclo, descanso corto en caso contrario.
 * - Tras cualquier descanso: estudio.
 *
 * `completedPomodoros` es el contador **ya actualizado** con el estudio
 * recién terminado: llamar `countPomodoro` primero y `nextPhase` después
 * (así el 4.º pomodoro de un objetivo de 4 devuelve `longBreak`).
 */
export function nextPhase(
  completedPomodoros: number,
  targetPomodoros: number,
  previousKind: PhaseKind,
): PhaseKind {
  if (previousKind !== 'study') {
    return 'study';
  }
  return completedPomodoros >= targetPomodoros ? 'longBreak' : 'shortBreak';
}

/**
 * Incrementa el contador del ciclo. Solo se llama al terminar un tiempo
 * de estudio completo (RF-5).
 */
export function countPomodoro(completedPomodoros: number): number {
  return completedPomodoros + 1;
}

/**
 * Devuelve el contador del ciclo a cero, al quedar preparado el
 * descanso largo (RF-2). Omitir un descanso no lo toca (RF-6).
 */
export function resetCycle(): number {
  return 0;
}

/**
 * Indica si la fase activa admite la acción "Omitir" (RF-6, RF-7):
 * únicamente los descansos.
 */
export function canOmit(phaseKind: PhaseKind): boolean {
  return phaseKind !== 'study';
}
