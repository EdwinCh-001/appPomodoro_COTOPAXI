/**
 * Bandera de bienvenida en el dispositivo (HU-006, RF-1, RF-9).
 *
 * Recuerda, sin guardar ningún dato personal, si el estudiante ya vio la
 * pantalla de bienvenida. Como toda la app, es local: nada sale del
 * dispositivo (RNF-1; decisiones 006 #1 y #3).
 *
 * No lanza hacia arriba: si el almacenamiento falla, se asume que la
 * bienvenida ya se vio (o aún no, según la operación) para no bloquear el
 * uso del temporizador (mismo criterio que `sessionSnapshot`).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/** Clave única de la bandera (ver inventario de datos del plan 006). */
export const WELCOME_STORAGE_KEY = 'welcomeSeen';

/**
 * Indica si la bienvenida ya se mostró (RF-1, RF-9). Ausente o corrupta se
 * interpreta como `false`: una instalación nueva —o unos datos borrados—
 * vuelve a mostrar la bienvenida.
 */
export async function hasSeenWelcome(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(WELCOME_STORAGE_KEY);
    return raw === 'true';
  } catch {
    return false;
  }
}

/**
 * Marca la bienvenida como vista (RF-1). Un fallo de escritura se ignora a
 * propósito: como mucho, la bienvenida volverá a aparecer en la próxima
 * apertura, que es un desenlace inofensivo.
 */
export async function markWelcomeSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(WELCOME_STORAGE_KEY, 'true');
  } catch {
    // Sin almacenamiento disponible: la bienvenida reaparecerá; no se rompe nada.
  }
}
