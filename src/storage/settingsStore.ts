/**
 * Almacén de ajustes (HU-005, RF-6, RF-7).
 *
 * Clave propia `settings@v1`, separada del snapshot de sesión para que un
 * futuro "restablecer sesión" no borre los ajustes del estudiante
 * (decisiones 005 #8). Las lecturas inválidas usan valores por defecto;
 * los fallos al guardar se propagan para que la interfaz los informe.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_SETTINGS,
  type Settings,
  isSettings,
} from '@/domain/settings';

/** Clave única de los ajustes (ver plan de la spec 005). */
export const SETTINGS_STORAGE_KEY = 'settings@v1';

/**
 * Guarda los ajustes (RF-1, RF-6). Propaga los fallos para evitar
 * confirmar un guardado que no llegó al almacenamiento.
 */
export async function saveSettings(settings: Settings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

/**
 * Carga los ajustes validados, o los valores por defecto si no existen,
 * están corruptos o quedaron fuera de rango (RF-7). Nunca lanza.
 */
export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw === null) {
      return DEFAULT_SETTINGS;
    }
    const parsed: unknown = JSON.parse(raw);
    return isSettings(parsed) ? parsed : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Restablece los ajustes a 25/5/15/4 y los persiste (RF-4, RF-8). Solo
 * toca los ajustes: no conoce ni la sesión ni el contador de pomodoros.
 */
export async function resetSettings(): Promise<Settings> {
  await saveSettings(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}
