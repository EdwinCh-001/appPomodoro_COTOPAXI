/**
 * Programación de la notificación de fin de fase (HU-004, RF-1, RF-2, RF-7).
 *
 * Programa una notificación local en el instante exacto en que termina la
 * fase en curso y la cancela cuando la fase deja de estar en curso
 * (pausar, reiniciar, omitir o cerrar la sesión). La dispara el sistema,
 * así que se entrega aunque la app esté cerrada (RNF-1; decisión 004 #6).
 */

import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';
import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';
import { cancelScheduledNotificationAsync } from 'expo-notifications/build/cancelScheduledNotificationAsync';
import { cancelAllScheduledNotificationsAsync } from 'expo-notifications/build/cancelAllScheduledNotificationsAsync';
import { dismissAllNotificationsAsync } from 'expo-notifications/build/dismissAllNotificationsAsync';
import { SchedulableTriggerInputTypes } from 'expo-notifications/build/Notifications.types';
import type { PhaseKind } from '@/domain/cycle';
import {
  ALARM_CHANNEL_ID,
  noticeContent,
  noticeIdFor,
} from '@/domain/notice';
import {
  NOTICE_SOUND,
  ensureAndroidChannel,
} from '@/notifications/permissions';

/**
 * Decide si se debe mostrar el aviso cuando la app está en primer plano.
 * El sistema pide un handler; se muestra banner, sonido y vibración, y se
 * mantiene el aviso en la lista (RF-1, RF-2).
 */
export function installNotificationHandler(): void {
  setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/**
 * Programa la notificación de fin de la fase `phaseKind` para el instante
 * `endAt` (epoch ms). Devuelve el identificador real asignado por el
 * sistema o `null` si no se pudo programar (nunca lanza).
 */
export async function schedulePhaseEnd(
  phaseKind: PhaseKind,
  endAt: number,
): Promise<string | null> {
  try {
    await ensureAndroidChannel();
    const { title, body } = noticeContent(phaseKind);
    return await scheduleNotificationAsync({
      identifier: noticeIdFor(phaseKind),
      content: {
        title,
        body,
        sound: NOTICE_SOUND,
        data: { phaseKind },
      },
      trigger: {
        type: SchedulableTriggerInputTypes.DATE,
        date: endAt,
        channelId: ALARM_CHANNEL_ID,
      },
    });
  } catch {
    return null;
  }
}

/**
 * Cancela la notificación programada de una fase (RF-7). Se usa al pausar,
 * reiniciar u omitir para que nunca avise de una fase que ya no corre.
 */
export async function cancelPhaseEnd(phaseKind: PhaseKind): Promise<void> {
  try {
    await cancelScheduledNotificationAsync(
      noticeIdFor(phaseKind),
    );
  } catch {
    // Si no existía, no hay nada que cancelar.
  }
}

/** Cancela todas las notificaciones programadas (cierre de sesión). */
export async function cancelAllPhaseEnds(): Promise<void> {
  try {
    await cancelAllScheduledNotificationsAsync();
  } catch {
    // Sin notificaciones programadas no hay nada que hacer.
  }
}

/**
 * Cancela el aviso ya entregado y visible en la bandeja (RF-4): al abrir
 * la app o tocar la notificación, el aviso deja de estar pendiente.
 */
export async function dismissDeliveredPhaseEnds(): Promise<void> {
  try {
    await dismissAllNotificationsAsync();
  } catch {
    // Sin notificaciones entregadas no hay nada que descartar.
  }
}
