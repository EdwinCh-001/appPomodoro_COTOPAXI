/**
 * `TimerControls` — botones de control de la fase (RF-5..RF-8 de HU-001;
 * RF-6 y RF-7 de HU-002).
 *
 * Iniciar/Pausar alterna según el estado; Reiniciar siempre visible y
 * siempre pide confirmación con un diálogo del sistema; Omitir aparece
 * **solo** cuando la fase activa es un descanso
 * (decisiones 001 #4, #5; decisiones 002 #4; skill `rn-conventions`).
 */

import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { palette } from '@/theme/colors';
import type { PhaseStatus } from '@/domain/timer';

export interface TimerControlsProps {
  /** Estado actual de la fase. */
  status: PhaseStatus;
  /** Inicia la fase desde el estado `ready` o `done` (RF-1). */
  onStart: () => void;
  /** Pausa una fase en curso (RF-3). */
  onPause: () => void;
  /** Reanuda una fase pausada (RF-4). */
  onResume: () => void;
  /** Reinicia la fase tras confirmar (RF-6). */
  onReset: () => void;
  /** Omite el descanso activo (RF-6 de HU-002). */
  onSkip: () => void;
  /** Indica si se puede omitir la fase activa (solo descansos). */
  canSkip: boolean;
  /**
   * Indica si se puede reiniciar la fase activa. Enmienda 2026-10-20:
   * solo el estudio ofrece "Reiniciar"; durante el descanso, no.
   */
  canReset: boolean;
  /**
   * La sesión terminó (fin del ciclo): solo se ofrece "Terminar sesión"
   * (enmienda fin de sesión 2026-10-20).
   */
  ended?: boolean;
  /** Cierra la sesión terminada y prepara un ciclo nuevo (RF-11). */
  onEndSession?: () => void;
}

export function TimerControls({
  status,
  onStart,
  onPause,
  onResume,
  onReset,
  onSkip,
  canSkip,
  canReset,
  ended = false,
  onEndSession,
}: TimerControlsProps) {
  const running = status === 'running';
  // Reiniciar exige que la fase lo permita (estudio) y que haya algo
  // que reiniciar (una fase ya iniciada).
  const showReset = canReset && status !== 'ready';

  const primaryLabel = running
    ? 'Pausar'
    : status === 'paused'
      ? 'Reanudar'
      : 'Iniciar';

  const handlePrimaryPress = () => {
    if (running) {
      onPause();
      return;
    }
    if (status === 'paused') {
      onResume();
      return;
    }
    onStart();
  };

  // RF-5 y RF-7 de HU-001: cancelar conserva el tiempo y el estado.
  const handleResetPress = () => {
    Alert.alert(
      'Reiniciar temporizador',
      '¿Seguro que quieres volver al tiempo inicial de esta fase?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Reiniciar', style: 'destructive', onPress: onReset },
      ],
    );
  };

  // RF-12 (enmienda fin de sesión): terminada la sesión, la única acción
  // posible es cerrarla; se ocultan los demás controles.
  if (ended) {
    return (
      <View style={styles.container}>
        <Pressable
          onPress={onEndSession}
          style={({ pressed }) => [
            styles.button,
            styles.primaryButton,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Terminar la sesión y empezar un ciclo nuevo"
        >
          <Text style={styles.buttonText}>Terminar sesión</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable
        onPress={handlePrimaryPress}
        style={({ pressed }) => [
          styles.button,
          styles.primaryButton,
          running && styles.pauseButton,
          pressed && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${primaryLabel} el temporizador`}
      >
        <Text style={[styles.buttonText, running && styles.pauseButtonText]}>
          {primaryLabel}
        </Text>
      </Pressable>

      {/* Enmienda 2026-10-20: en descanso solo Pausar/Reanudar y Omitir. */}
      {showReset && (
        <Pressable
          onPress={handleResetPress}
          style={({ pressed }) => [
            styles.button,
            styles.resetButton,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Reiniciar el temporizador"
        >
          <Text style={styles.resetButtonText}>Reiniciar</Text>
        </Pressable>
      )}

      {/* RF-7 de HU-002: durante el estudio no se muestra "Omitir". */}
      {canSkip && (
        <Pressable
          onPress={onSkip}
          style={({ pressed }) => [
            styles.button,
            styles.skipButton,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Omitir el descanso y pasar al estudio"
        >
          <Text style={styles.skipButtonText}>Omitir descanso</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 12,
  },
  button: {
    minHeight: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  pressed: {
    opacity: 0.8,
  },
  primaryButton: {
    backgroundColor: palette.primary,
  },
  pauseButton: {
    backgroundColor: palette.pause,
  },
  resetButton: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.danger,
  },
  skipButton: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.primary,
  },
  buttonDisabled: {
    borderColor: palette.border,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.onDark,
  },
  pauseButtonText: {
    color: palette.onPause,
  },
  resetButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.danger,
  },
  skipButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.header,
  },
});
