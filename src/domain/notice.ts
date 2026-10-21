/**
 * Aviso de fin de fase — funciones puras (HU-004, spec 004).
 *
 * Decide **qué** dice el aviso, **cuándo** pedir el permiso de
 * notificaciones y **cuándo** suena la alarma in-app. Sin React, sin
 * módulos nativos y sin almacenamiento: la interfaz solo aplica lo que
 * aquí se decide (Constitución #5 y #6; decisiones 004 #4, #6, #7).
 */

import type { PhaseKind } from '@/domain/cycle';

/** Contenido del aviso: título y cuerpo, ambos en español (RNF-4). */
export interface NoticeContent {
  title: string;
  body: string;
}

/**
 * Título por fase terminada. Única fuente de los textos: la interfaz y
 * las pruebas comparten estas palabras (decisión 004 #4; RNF-4).
 */
export const NOTICE_TITLES: Record<PhaseKind, string> = {
  study: '¡Estudio terminado!',
  shortBreak: '¡Descanso corto terminado!',
  longBreak: '¡Descanso largo terminado!',
};

/** Cuerpo por fase terminada: el llamado a la acción según lo que sigue. */
const NOTICE_BODIES: Record<PhaseKind, string> = {
  study: 'Toca para iniciar el descanso corto.',
  shortBreak: 'Toca para volver al estudio.',
  longBreak: 'Toca para volver al estudio.',
};

/**
 * Contenido del aviso de una fase terminada (RF-1, RNF-4). Identifica
 * qué fase terminó y qué conviene hacer después.
 */
export function noticeContent(phaseKind: PhaseKind): NoticeContent {
  return {
    title: NOTICE_TITLES[phaseKind],
    body: NOTICE_BODIES[phaseKind],
  };
}

/** Estado del permiso de notificaciones, según el sistema. */
export type PermissionStatus = 'granted' | 'undetermined' | 'denied';

/**
 * Indica si toca pedir el permiso (RF-5, RNF-3).
 *
 * Solo en el **primer** inicio del temporizador y únicamente cuando el
 * permiso aún no se ha decidido (`undetermined`). Una vez concedido o
 * denegado no se vuelve a insistir automáticamente.
 */
export function shouldAskPermission(
  firstStart: boolean,
  permissionStatus: PermissionStatus,
): boolean {
  return firstStart && permissionStatus === 'undetermined';
}

/** Estado de primer plano de la app (`AppState.currentState`). */
export type AppStateValue = 'active' | 'background' | 'inactive' | string;

/**
 * Indica si debe sonar la alarma in-app (RF-3, RF-4): solo con la app en
 * primer plano (`active`) y una fase recién terminada. Con la app en
 * segundo plano el aviso lo cubre la notificación del sistema.
 */
export function shouldPlayInAppAlarm(
  appState: AppStateValue,
  phaseJustFinished: boolean,
): boolean {
  return appState === 'active' && phaseJustFinished;
}

/**
 * Patrón de vibración constante y distintivo, compartido por la
 * notificación y la alarma in-app (RF-8; decisión 004 #7). El formato es
 * `[esperaMs, vibraMs, esperaMs, vibraMs, ...]` de React Native
 * `Vibration.vibrate`.
 */
export function alarmVibrationPattern(): number[] {
  return [0, 400, 200, 400, 200, 400];
}

/** Identificador del canal de notificaciones en Android (RF-2). */
export const ALARM_CHANNEL_ID = 'pomodoro-fin-de-fase';

/**
 * Identificador estable de la notificación de una fase (RF-7). Permite
 * cancelar exactamente la notificación correcta al pausar, reiniciar u
 * omitir.
 */
export function noticeIdFor(phaseKind: PhaseKind): string {
  return `pomodoro-phase-end:${phaseKind}`;
}
