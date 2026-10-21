/**
 * Textos de fase en español (HU-002). Única fuente de nombres, para que
 * la interfaz y las pruebas usen las mismas palabras.
 */

import type { PhaseKind } from '@/domain/cycle';

/** Nombre visible de cada tipo de fase. */
export const PHASE_LABELS: Record<PhaseKind, string> = {
  study: 'Estudio',
  shortBreak: 'Descanso corto',
  longBreak: 'Descanso largo',
};

/** Indica si la fase es de descanso (tema y acción "Omitir"). */
export function isBreak(phaseKind: PhaseKind): boolean {
  return phaseKind !== 'study';
}
