/**
 * Alarma in-app (HU-004, RF-3, RF-4, RF-8).
 *
 * Suena y vibra cuando una fase termina con la app en primer plano, sin
 * depender del volumen de notificaciones del sistema. Es un singleton de
 * módulo: la interfaz llama `play`/`stop` y no gestiona el reproductor.
 *
 * Limitación documentada (decisiones 004 #1): con la app en segundo plano
 * o el volumen del sistema en cero, el aviso sonoro queda a cargo de la
 * notificación; la alarma in-app cubre el caso "app abierta en silencio".
 */

import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { Vibration } from 'react-native';
import { alarmVibrationPattern } from '@/domain/notice';

/** Sonido de alarma embebido en el bundle (sin descargas; RNF-1). */
const ALARM_SOUND = require('../../assets/sounds/alarm.wav');

let player: ReturnType<typeof createAudioPlayer> | null = null;

/** Crea el reproductor una sola vez y lo deja en bucle de alarma. */
function getPlayer(): ReturnType<typeof createAudioPlayer> | null {
  if (player !== null) {
    return player;
  }
  try {
    player = createAudioPlayer(ALARM_SOUND);
    player.loop = true;
    player.volume = 1;
    return player;
  } catch {
    return null;
  }
}

/**
 * Configura la sesión de audio para que la alarma suene aunque el celular
 * esté en modo silencio (RF-3). Se llama al montar la pantalla principal.
 */
export async function prepareAlarm(): Promise<void> {
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'doNotMix',
    });
  } catch {
    // Si no se puede configurar, la alarma aún intenta sonar.
  }
}

/**
 * Arranca la alarma: reproduce el sonido en bucle y vibra con el patrón
 * distintivo compartido con la notificación (RF-3, RF-8).
 */
export function playAlarm(): void {
  const instance = getPlayer();
  try {
    instance?.seekTo(0);
    instance?.play();
  } catch {
    // Sin audio disponible, al menos se intenta la vibración.
  }
  try {
    Vibration.vibrate(alarmVibrationPattern(), true);
  } catch {
    // La vibración no está disponible en todas las plataformas.
  }
}

/** Detiene la alarma: corta sonido y vibración (RF-4). */
export function stopAlarm(): void {
  try {
    player?.pause();
    player?.seekTo(0);
  } catch {
    // Si ya estaba detenida, no hay nada que hacer.
  }
  Vibration.cancel();
}

/** Libera el reproductor al desmontar la pantalla principal. */
export function releaseAlarm(): void {
  stopAlarm();
  try {
    player?.release();
  } catch {
    // Ignorado: el reproductor puede haberse liberado ya.
  }
  player = null;
}
