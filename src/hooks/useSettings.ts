/**
 * Hook `useSettings` — ajustes del Pomodoro en la interfaz (HU-005).
 *
 * Envuelve el contexto compartido: el estado es único para toda la app,
 * así un guardado en la pantalla de ajustes llega de inmediato al
 * temporizador (RF-1, RF-5, RF-6).
 */

import {
  type SettingsContextValue,
  useSettingsContext,
} from '@/hooks/settingsContext';

export type UseSettingsResult = SettingsContextValue;

export function useSettings(): UseSettingsResult {
  return useSettingsContext();
}
