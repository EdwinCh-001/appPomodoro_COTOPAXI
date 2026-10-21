/**
 * Pantalla principal — temporizador y ciclos Pomodoro (HU-001, HU-002).
 *
 * Los controles Iniciar/Pausar/Reiniciar/Omitir viven aquí, sin
 * navegación adicional (RF-8). El tema visual cambia entre estudio y
 * descanso (decisiones 002 #7; skill `cotopaxi-brand`). La lógica del
 * tiempo y del ciclo está en el hook y en `src/domain/`.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CycleIndicator } from '@/components/CycleIndicator';
import { TimerControls } from '@/components/TimerControls';
import { TimerDisplay } from '@/components/TimerDisplay';
import { Welcome } from '@/components/Welcome';
import { canOmit } from '@/domain/cycle';
import { formatTime } from '@/domain/format';
import { PHASE_LABELS, isBreak } from '@/domain/labels';
import { settingsToDurations } from '@/domain/settings';
import { useNotifications } from '@/hooks/useNotifications';
import { useSettings } from '@/hooks/useSettings';
import { useTimer } from '@/hooks/useTimer';
import { hasSeenWelcome, markWelcomeSeen } from '@/storage/welcomeFlag';
import { palette } from '@/theme/colors';

export default function HomeScreen() {
  const router = useRouter();
  const { settings } = useSettings();

  // Bienvenida de la primera apertura (spec 006, RF-1, RF-9). Mientras se
  // lee la bandera no se decide nada: evita mostrar el temporizador por un
  // instante antes de la bienvenida.
  const [showWelcome, setShowWelcome] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    void hasSeenWelcome().then((seen) => {
      if (!cancelled) {
        setShowWelcome(!seen);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const {
    permissionStatus,
    isFirstStart,
    shouldAskOnStart,
    askPermission,
    markStarted,
    notifyPhaseFinished,
    silence,
  } = useNotifications();

  // Las duraciones derivan de los ajustes (spec 005). Al guardar o
  // restablecer, el ciclo vuelve a empezar de cero con los valores nuevos.
  const durations = useMemo(() => settingsToDurations(settings), [settings]);

  const {
    phaseKind,
    status,
    remainingSeconds,
    completedPomodoros,
    targetPomodoros,
    sessionEnded,
    start,
    pause,
    resume,
    reset,
    skip,
    endSession,
    clearPendingNotice,
  } = useTimer({
    durations,
    targetPomodoros: settings.pomodorosPerCycle,
    onPhaseFinished: notifyPhaseFinished,
  });

  const breakTime = isBreak(phaseKind);

  // La app no muestra ningún aviso emergente de "fase terminada": el aviso
  // lo cubren la notificación y la alarma in-app (spec 004). El pendiente
  // de la reconciliación solo se descarta.
  useEffect(() => {
    clearPendingNotice();
  }, [clearPendingNotice]);

  // Toda interacción del usuario silencia la alarma en curso (RF-4).
  const withSilence = useCallback(
    (action: () => void) => () => {
      silence();
      action();
    },
    [silence],
  );

  /**
   * Iniciar con pre-permission (RF-5): en el primer Iniciar sin permiso se
   * explica para qué se necesita antes del diálogo del sistema y recién
   * entonces se solicita; después nunca se insiste (RNF-3). El
   * temporizador arranca igual, conceda o no el usuario.
   */
  const handleStart = useCallback(() => {
    if (shouldAskOnStart()) {
      markStarted();
      Alert.alert(
        'Permiso de notificaciones',
        'La app necesita permiso para avisarte con una notificación cuando ' +
          'termine un tiempo de estudio o descanso, aunque no estés mirando ' +
          'la pantalla. Puedes cambiarlo cuando quieras.',
        [
          {
            text: 'Continuar',
            onPress: () => {
              void (async () => {
                await askPermission();
                start();
              })();
            },
          },
        ],
      );
      return;
    }
    if (isFirstStart()) {
      markStarted();
    }
    start();
  }, [askPermission, isFirstStart, markStarted, shouldAskOnStart, start]);

  const onStart = useCallback(() => {
    silence();
    handleStart();
  }, [handleStart, silence]);

  /** "Empezar" de la bienvenida: marca la bandera y deja el temporizador (RF-1). */
  const handleWelcomeStart = useCallback(() => {
    void markWelcomeSeen();
    setShowWelcome(false);
  }, []);

  // Sin decisión tomada o con bienvenida pendiente: se muestra la
  // bienvenida (o nada, mientras se lee la bandera) en lugar del temporizador.
  if (showWelcome === null) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <StatusBar style="light" />
      </SafeAreaView>
    );
  }

  if (showWelcome) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <StatusBar style="dark" />
        <Welcome onStart={handleWelcomeStart} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Academia Cotopaxi</Text>
          <Text style={styles.headerSubtitle}>Temporizador de estudio</Text>
        </View>
        <Pressable
          onPress={() => router.push('/settings')}
          style={({ pressed }) => [
            styles.settingsButton,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Abrir ajustes"
        >
          <Text style={styles.settingsButtonText}>Ajustes</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        <CycleIndicator
          completed={completedPomodoros}
          target={targetPomodoros}
          phaseLabel={PHASE_LABELS[phaseKind]}
        />
        <TimerDisplay
          time={formatTime(remainingSeconds)}
          status={status}
          phaseLabel={PHASE_LABELS[phaseKind]}
          variant={breakTime ? 'break' : 'study'}
        />
        <TimerControls
          status={status}
          onStart={onStart}
          onPause={withSilence(pause)}
          onResume={withSilence(resume)}
          onReset={withSilence(reset)}
          onSkip={withSilence(skip)}
          canSkip={canOmit(phaseKind)}
          canReset={!breakTime}
          ended={sessionEnded}
          onEndSession={withSilence(endSession)}
        />
        {permissionStatus === 'denied' ? (
          <Text style={styles.permissionHint}>
            Las notificaciones están desactivadas. La app sigue funcionando y
            avisará con la pantalla abierta. Puedes activarlas desde Ajustes.
          </Text>
        ) : null}
      </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  headerText: {
    flex: 1,
  },
  settingsButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.background,
  },
  settingsButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.onDark,
  },
  pressed: {
    opacity: 0.8,
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
  content: {
    flex: 1,
    padding: 24,
    gap: 24,
    justifyContent: 'center',
  },
  permissionHint: {
    fontSize: 13,
    lineHeight: 18,
    color: palette.textMuted,
    textAlign: 'center',
  },
});
