/**
 * `CycleIndicator` — avance del ciclo Pomodoro (RF-8, RNF-2).
 *
 * Fila de puntos (uno por pomodoro del ciclo, relleno si está completado)
 * más una etiqueta de texto. El avance se lee en el texto, no solo en el
 * color (skill `rn-conventions`).
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { palette } from '@/theme/colors';

export interface CycleIndicatorProps {
  /** Pomodoros completados en el ciclo actual. */
  completed: number;
  /** Pomodoros necesarios para el descanso largo. */
  target: number;
  /** Nombre de la fase activa. */
  phaseLabel: string;
}

export function CycleIndicator({
  completed,
  target,
  phaseLabel,
}: CycleIndicatorProps) {
  const dots = Array.from({ length: target }, (_, index) => index < completed);
  // Texto explícito del avance: nunca depender solo del color (RNF-2).
  const progressText = `Pomodoro ${completed} de ${target}`;

  return (
    <View
      style={styles.container}
      accessibilityLabel={`${phaseLabel}. ${progressText} completados`}
    >
      <View style={styles.dotsRow}>
        {dots.map((filled, index) => (
          <View
            key={`pomodoro-${index + 1}`}
            style={[styles.dot, filled ? styles.dotFilled : styles.dotEmpty]}
          />
        ))}
      </View>
      <Text style={styles.progressText}>{progressText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 10,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 999,
    borderWidth: 2,
  },
  dotFilled: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  dotEmpty: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
  },
  progressText: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.text,
  },
});
