/**
 * Permiso de notificaciones (HU-004, RF-5, RF-6, RNF-3).
 *
 * Única puerta al permiso del sistema: consulta el estado, lo solicita
 * una sola vez y expone un estado normalizado que la interfaz usa para
 * el modo degradado. Nunca lanza hacia arriba: ante cualquier fallo del
 * módulo nativo devuelve un estado seguro (decisión 004 #3).
 */

import { Linking, Platform } from 'react-native';
import {
  type NotificationPermissionsStatus,
  IosAuthorizationStatus,
} from 'expo-notifications/build/NotificationPermissions.types';
import {
  getPermissionsAsync,
  requestPermissionsAsync,
} from 'expo-notifications/build/NotificationPermissions';
import { setNotificationChannelAsync } from 'expo-notifications/build/setNotificationChannelAsync';
import { AndroidImportance } from 'expo-notifications/build/NotificationChannelManager.types';
import {
  ALARM_CHANNEL_ID,
  type PermissionStatus,
  alarmVibrationPattern,
} from '@/domain/notice';

/**
 * Nombre visible del canal de Android. Debe existir antes de pedir el
 * permiso en Android 13+, o el diálogo del sistema no aparece.
 */
const CHANNEL_NAME = 'Fin de fase de estudio';

/** Sonido de aviso embebido (mismo WAV que la alarma in-app). */
export const NOTICE_SOUND = 'alarm.wav';

/** Normaliza el estado de permiso de `expo-notifications`. */
function normalizeStatus(
  status: NotificationPermissionsStatus,
): PermissionStatus {
  // iOS expone un estado más granular; PROVISIONAL cuenta como concedido.
  if (status.granted) {
    return 'granted';
  }
  if (status.ios?.status === IosAuthorizationStatus.PROVISIONAL) {
    return 'granted';
  }
  if (status.canAskAgain) {
    return 'undetermined';
  }
  return 'denied';
}

/**
 * Prepara el canal de notificaciones en Android (RF-2). Es un no-op en
 * plataformas que no lo usan. El canal lleva el patrón de vibración
 * distintivo compartido con la alarma in-app (RF-8).
 */
export async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }
  try {
    await setNotificationChannelAsync(ALARM_CHANNEL_ID, {
      name: CHANNEL_NAME,
      importance: AndroidImportance.MAX,
      vibrationPattern: alarmVibrationPattern(),
      enableVibrate: true,
      sound: NOTICE_SOUND,
    });
  } catch {
    // Sin canal la notificación igualmente se entrega con los valores por
    // defecto; no se bloquea el temporizador por esto.
  }
}

/** Consulta el estado actual del permiso, sin pedirlo (RF-5, RNF-3). */
export async function getPermissionStatus(): Promise<PermissionStatus> {
  try {
    const status = await getPermissionsAsync();
    return normalizeStatus(status);
  } catch {
    return 'denied';
  }
}

/**
 * Solicita el permiso al sistema. Solo debe llamarse tras la explicación
 * previa (RF-5) y como máximo una vez (RNF-3): el llamador decide con
 * `shouldAskPermission`.
 */
export async function requestPermission(): Promise<PermissionStatus> {
  try {
    await ensureAndroidChannel();
    const status = await requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: false, allowSound: true },
    });
    return normalizeStatus(status);
  } catch {
    return 'denied';
  }
}

/**
 * Abre los ajustes del sistema para revisar el permiso (RF-6). Es la
 * salida del modo degradado; nunca bloquea el uso del temporizador.
 */
export async function openSystemSettings(): Promise<void> {
  try {
    await Linking.openSettings();
  } catch {
    // Si el sistema no puede abrir los ajustes, no hay más que hacer.
  }
}
