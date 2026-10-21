/**
 * Hook `useNotifications` — permiso y aviso de fin de fase (HU-004).
 *
 * Encapsula el estado del permiso, la explicación previa (pre-permission)
 * antes del primer Iniciar y el ciclo de vida de la alarma in-app, para
 * que la pantalla principal solo conecte acciones. La lógica pura vive en
 * `src/domain/notice.ts` (Constitución #5).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import type { PhaseKind } from '@/domain/cycle';
import {
  type PermissionStatus,
  shouldAskPermission,
  shouldPlayInAppAlarm,
} from '@/domain/notice';
import {
  playAlarm,
  prepareAlarm,
  releaseAlarm,
  stopAlarm,
} from '@/notifications/inAppAlarm';
import {
  getPermissionStatus,
  requestPermission,
} from '@/notifications/permissions';
import {
  dismissDeliveredPhaseEnds,
  installNotificationHandler,
} from '@/notifications/scheduler';

export interface UseNotificationsResult {
  /** Estado actual del permiso de notificaciones. */
  permissionStatus: PermissionStatus;
  /** `true` mientras no se ha pulsado Iniciar por primera vez. */
  isFirstStart: () => boolean;
  /** Indica si toca explicar y pedir el permiso en este Iniciar (RF-5). */
  shouldAskOnStart: () => boolean;
  /** Pide el permiso al sistema tras la explicación (RF-5, RNF-3). */
  askPermission: () => Promise<void>;
  /** Marca que el primer Iniciar ya ocurrió (no se vuelve a explicar). */
  markStarted: () => void;
  /** Arranca la alarma in-app si corresponde (RF-3). */
  notifyPhaseFinished: (phaseKind: PhaseKind) => void;
  /** Silencia la alarma (al interactuar o abrir la app; RF-4). */
  silence: () => void;
}

export function useNotifications(): UseNotificationsResult {
  const [permissionStatus, setPermissionStatus] =
    useState<PermissionStatus>('undetermined');

  // `true` hasta el primer Iniciar del temporizador. El permiso se pide
  // entonces y solo entonces (decisión 004 #2; RNF-3).
  const startedOnceRef = useRef(false);
  // Estado de primer plano de la app, para decidir la alarma in-app.
  const appStateRef = useRef(AppState.currentState ?? 'active');

  // Preparativos al montar: handler de presentación, canal de Android,
  // sesión de audio de la alarma y estado actual del permiso.
  useEffect(() => {
    installNotificationHandler();
    void prepareAlarm();
    void dismissDeliveredPhaseEnds();
    void getPermissionStatus().then(setPermissionStatus);

    return () => {
      releaseAlarm();
    };
  }, []);

  // Sigue el estado de la app para saber si está en primer plano.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next) => {
      appStateRef.current = next;
      // Al volver al primer plano, se descarta el aviso ya entregado y se
      // silencia cualquier alarma (RF-4).
      if (next === 'active') {
        void dismissDeliveredPhaseEnds();
        stopAlarm();
      }
    });
    return () => subscription.remove();
  }, []);

  const isFirstStart = useCallback(() => !startedOnceRef.current, []);

  const shouldAskOnStart = useCallback(
    () => shouldAskPermission(!startedOnceRef.current, permissionStatus),
    [permissionStatus],
  );

  const askPermission = useCallback(async () => {
    const status = await requestPermission();
    setPermissionStatus(status);
  }, []);

  const markStarted = useCallback(() => {
    startedOnceRef.current = true;
  }, []);

  const notifyPhaseFinished = useCallback((phaseKind: PhaseKind) => {
    void phaseKind;
    // Solo con la app en primer plano (RF-3); si no, ya lo cubre la
    // notificación del sistema.
    if (shouldPlayInAppAlarm(appStateRef.current, true)) {
      playAlarm();
    }
  }, []);

  const silence = useCallback(() => {
    stopAlarm();
  }, []);

  return {
    permissionStatus,
    isFirstStart,
    shouldAskOnStart,
    askPermission,
    markStarted,
    notifyPhaseFinished,
    silence,
  };
}
