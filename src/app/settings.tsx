/**
 * Pantalla de ajustes — configuración de tiempos (HU-005, RF-1..RF-4).
 *
 * Ruta propia aprobada en decisiones 001 #7. Campos numéricos con
 * teclado numérico, mensajes inline en español y contenedor desplazable
 * para que el teclado no tape campos ni botones
 * (skills `rn-conventions` y `cotopaxi-brand`).
 */

import React, { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  DEFAULT_SETTINGS,
  type SettingsField,
  type SettingsInput,
  RANGES,
  settingsToInput,
  validateSettings,
} from '@/domain/settings';
import type { PermissionStatus } from '@/domain/notice';
import {
  getPermissionStatus,
  openSystemSettings,
} from '@/notifications/permissions';
import { useSettings } from '@/hooks/useSettings';
import { palette } from '@/theme/colors';

interface FieldConfig {
  field: SettingsField;
  label: string;
  unidad: string;
}

/** Campos mostrados, en el orden del formulario. */
const FIELDS: FieldConfig[] = [
  { field: 'studyMinutes', label: 'Tiempo de estudio', unidad: 'minutos' },
  { field: 'shortBreakMinutes', label: 'Descanso corto', unidad: 'minutos' },
  { field: 'longBreakMinutes', label: 'Descanso largo', unidad: 'minutos' },
  { field: 'pomodorosPerCycle', label: 'Pomodoros por ciclo', unidad: 'pomodoros' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, save, reset } = useSettings();
  const [permissionStatus, setPermissionStatus] =
    useState<PermissionStatus>('undetermined');
  const [input, setInput] = useState<SettingsInput>(() =>
    settingsToInput(settings),
  );
  const [errors, setErrors] = useState<
    Partial<Record<SettingsField, string>>
  >({});

  // Estado del permiso para el enlace "Revisar permiso" del modo degradado
  // (RF-6). Se refresca al volver de los ajustes del sistema.
  useEffect(() => {
    void getPermissionStatus().then(setPermissionStatus);
  }, []);

  const handleChange = (field: SettingsField, value: string) => {
    setInput((prev) => ({ ...prev, [field]: value }));
    // El mensaje desaparece al corregir el campo correspondiente.
    setErrors((prev) => {
      if (!(field in prev)) {
        return prev;
      }
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSave = async () => {
    const result = validateSettings(input);
    if (!result.ok) {
      // RF-3: no se guarda nada y se muestran todos los errores juntos.
      setErrors(result.errors);
      return;
    }
    try {
      await save(result.settings);
      setErrors({});
      router.back();
    } catch {
      Alert.alert(
        'No se pudieron guardar los ajustes',
        'Inténtalo de nuevo. Tus cambios todavía no se han guardado.',
      );
    }
  };

  // Restablece los ajustes y actualiza los campos visibles de inmediato,
  // sin esperar a que termine la escritura en disco.
  const handleReset = () => {
    Alert.alert(
      'Restablecer valores por defecto',
      '¿Volver a 25/5/15/4? La fase activa volverá a esperar Iniciar con los valores por defecto.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restablecer',
          style: 'destructive',
          onPress: () => {
            // Los campos se refrescan ya con los valores por defecto.
            setInput(settingsToInput(DEFAULT_SETTINGS));
            setErrors({});
            void reset().catch(() => {
              // Si la escritura falla, se re-sincroniza con los vigentes.
              setInput(settingsToInput(settings));
              Alert.alert(
                'No se pudieron restablecer los ajustes',
                'Inténtalo de nuevo. Los valores no se han guardado.',
              );
            });
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ajustes</Text>
        <Text style={styles.headerSubtitle}>Configura tus tiempos de estudio</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {FIELDS.map(({ field, label, unidad }) => {
          const [min, max] = RANGES[field];
          const error = errors[field];
          return (
            <View key={field} style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>{label}</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, error ? styles.inputError : null]}
                  value={input[field]}
                  onChangeText={(value) => handleChange(field, value)}
                  keyboardType="number-pad"
                  inputMode="numeric"
                  maxLength={3}
                  accessibilityLabel={`${label}, entre ${min} y ${max} ${unidad}`}
                />
                <Text style={styles.unit}>{unidad}</Text>
              </View>
              {error ? (
                <Text style={styles.errorText} accessibilityRole="alert">
                  {error}
                </Text>
              ) : (
                <Text style={styles.hintText}>
                  Entre {min} y {max} {unidad}
                </Text>
              )}
            </View>
          );
        })}

        <Pressable
          onPress={() => void handleSave()}
          style={({ pressed }) => [
            styles.button,
            styles.primaryButton,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Guardar ajustes"
        >
          <Text style={styles.primaryButtonText}>Guardar ajustes</Text>
        </Pressable>

        <Pressable
          onPress={handleReset}
          style={({ pressed }) => [
            styles.button,
            styles.resetButton,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Restablecer valores por defecto"
        >
          <Text style={styles.resetButtonText}>
            Restablecer valores por defecto
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.button,
            styles.cancelButton,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Volver sin guardar"
        >
          <Text style={styles.cancelButtonText}>Volver</Text>
        </Pressable>

        {permissionStatus === 'denied' ? (
          <View style={styles.permissionBlock}>
            <Text style={styles.permissionText}>
              Las notificaciones están desactivadas. La app avisará con la
              pantalla abierta; para recibir el aviso con la app cerrada,
              actívalas en los ajustes del sistema.
            </Text>
            <Pressable
              onPress={() => void openSystemSettings()}
              style={({ pressed }) => [
                styles.button,
                styles.permissionButton,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Revisar el permiso de notificaciones"
            >
              <Text style={styles.permissionButtonText}>Revisar permiso</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  header: {
    backgroundColor: palette.header,
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: palette.onDark,
  },
  headerSubtitle: {
    fontSize: 14,
    color: palette.onDark,
    marginTop: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    gap: 20,
  },
  fieldBlock: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.text,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    minHeight: 52,
    backgroundColor: palette.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 16,
    fontSize: 18,
    color: palette.text,
  },
  inputError: {
    borderColor: palette.danger,
    borderWidth: 2,
  },
  unit: {
    fontSize: 15,
    color: palette.textMuted,
    minWidth: 80,
  },
  hintText: {
    fontSize: 13,
    color: palette.textMuted,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.danger,
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
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.onDark,
  },
  resetButton: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.danger,
  },
  resetButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.danger,
  },
  cancelButton: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  cancelButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.header,
  },
  permissionBlock: {
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  permissionText: {
    fontSize: 13,
    lineHeight: 18,
    color: palette.textMuted,
  },
  permissionButton: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.primary,
  },
  permissionButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.primary,
  },
});
