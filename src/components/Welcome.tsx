/**
 * `Welcome` — bienvenida de la primera apertura (HU-006, RF-1, RF-2, RNF-2).
 *
 * Una sola página con la identidad Cotopaxi, texto en español y un único
 * botón "Empezar". No pide datos ni navega a ningún registro (no existe):
 * el único destino es el temporizador (decisiones 006 #1 y #8).
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palette } from '@/theme/colors';

export interface WelcomeProps {
  /** Se llama al tocar "Empezar": marca la bandera y muestra el temporizador. */
  onStart: () => void;
}

export function Welcome({ onStart }: WelcomeProps) {
  return (
    <View style={styles.container}>
      <View style={styles.brandBlock}>
        <Text style={styles.brand}>Academia Cotopaxi</Text>
        <Text style={styles.title}>Tu temporizador de estudio</Text>
        <Text style={styles.description}>
          Organiza el estudio en tiempos de concentración y descansos, sin
          cuentas, sin internet y sin anuncios.
        </Text>
      </View>

      <Pressable
        onPress={onStart}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Empezar a usar el temporizador"
      >
        <Text style={styles.buttonText}>Empezar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    gap: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: palette.background,
  },
  brandBlock: {
    gap: 12,
    alignItems: 'center',
  },
  brand: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: palette.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    color: palette.header,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: palette.textMuted,
  },
  button: {
    minWidth: 220,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: palette.primary,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.onDark,
  },
  pressed: {
    opacity: 0.85,
  },
});
