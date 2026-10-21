/**
 * Snapshot de sesión en el dispositivo (HU-003, RF-1, RF-6, RF-7, RF-8).
 *
 * Única puerta al almacenamiento local de la sesión. Nunca lanza hacia
 * arriba: ante datos ilegibles devuelve `null` para que la
 * reconciliación arranque con los valores por defecto
 * (decisiones 003 #6). Todo es local, nada sale del dispositivo (RNF-3).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  type SessionSnapshot,
  SNAPSHOT_SCHEMA_VERSION,
} from '@/domain/reconcile';

/** Clave única del snapshot de sesión (ver plan de la spec 003). */
export const SESSION_STORAGE_KEY = 'session@v1';

const PHASE_KINDS = ['study', 'shortBreak', 'longBreak'];
const PHASE_STATUSES = ['ready', 'running', 'paused', 'done'];

/** Comprueba que un valor desconocido tenga la forma esperada (RF-6). */
function isSessionSnapshot(value: unknown): value is SessionSnapshot {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;

  return (
    candidate.schemaVersion === SNAPSHOT_SCHEMA_VERSION &&
    typeof candidate.phaseKind === 'string' &&
    PHASE_KINDS.includes(candidate.phaseKind) &&
    typeof candidate.status === 'string' &&
    PHASE_STATUSES.includes(candidate.status) &&
    (candidate.endAt === null || typeof candidate.endAt === 'number') &&
    typeof candidate.remainingSeconds === 'number' &&
    typeof candidate.completedPomodoros === 'number' &&
    typeof candidate.targetPomodoros === 'number' &&
    // Opcional (enmienda fin de sesión 2026-10-20): un snapshot antiguo
    // sin el campo sigue siendo válido y se interpreta como `false`.
    (candidate.sessionEnded === undefined ||
      typeof candidate.sessionEnded === 'boolean')
  );
}

/**
 * Guarda el snapshot (RF-1, RF-7). Los fallos de escritura se ignoran a
 * propósito: perder una escritura no debe romper el temporizador, y la
 * siguiente (transición o tick) volverá a intentarlo.
 */
export async function saveSnapshot(snapshot: SessionSnapshot): Promise<void> {
  try {
    await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Sin espacio o almacenamiento no disponible: se reintenta en el próximo guardado.
  }
}

/**
 * Carga el snapshot validado, o `null` si no existe, está corrupto o es
 * de una versión desconocida (RF-6, RF-8). Nunca lanza.
 */
export async function loadSnapshot(): Promise<SessionSnapshot | null> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
    if (raw === null) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    return isSessionSnapshot(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Borra el snapshot guardado. Útil para pruebas o un reinicio limpio. */
export async function clearSnapshot(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // Nada que hacer: la ausencia de datos equivale a primera ejecución.
  }
}
