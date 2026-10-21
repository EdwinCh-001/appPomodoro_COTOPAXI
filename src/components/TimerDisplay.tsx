/**
 * `TimerDisplay` — tiempo restante `mm:ss`, fase y estado (HU-001, HU-002).
 *
 * El estado y el tipo de fase se comunican con texto, no solo con color
 * (skill `rn-conventions`). El tema visual distingue estudio de descanso
 * (decisiones 002 #7; skill `cotopaxi-brand`).
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { palette } from '@/theme/colors';
import type { PhaseStatus } from '@/domain/timer';

/** Etiquetas en español del estado de la fase (spec 001, "Definiciones"). */
const STATUS_LABELS: Record<PhaseStatus, string> = {
  ready: 'Lista',
  running: 'En curso',
  paused: 'Pausada',
  done: 'Terminada',
};

export interface TimerDisplayProps {
  /** Tiempo restante ya formateado (`mm:ss`). */
  time: string;
  /** Estado de la fase. */
  status: PhaseStatus;
  /** Nombre de la fase mostrada. */
  phaseLabel: string;
  /** Tema visual: estudio (primario) o descanso (verde). */
  variant?: 'study' | 'break';
}

export function TimerDisplay({
  time,
  status,
  phaseLabel,
  variant = 'study',
}: TimerDisplayProps) {
  const done = status === 'done';
  const isBreak = variant === 'break';

  return (
    <View
      style={[
        styles.card,
        isBreak ? styles.cardBreak : styles.cardStudy,
      ]}
    >
      <Text style={styles.phaseLabel}>{phaseLabel}</Text>
      <Text
        style={[styles.time, done && styles.timeDone]}
        accessibilityLabel={`Tiempo restante ${time}`}
        accessibilityRole="timer"
      >
        {time}
      </Text>
      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>{STATUS_LABELS[status]}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 6,
  },
  cardStudy: {
    borderTopColor: palette.primary,
  },
  cardBreak: {
    borderTopColor: palette.pause,
  },
  phaseLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.textMuted,
    marginBottom: 12,
  },
  time: {
    fontSize: 72,
    fontWeight: '700',
    color: palette.text,
    fontVariant: ['tabular-nums'],
  },
  timeDone: {
    color: palette.danger,
  },
  statusBadge: {
    marginTop: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: palette.background,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.text,
  },
});
