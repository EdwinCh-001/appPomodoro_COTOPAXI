/**
 * Contexto de ajustes — estado único para toda la app (HU-005).
 *
 * Sin un estado compartido, cada pantalla cargaría los ajustes por su
 * cuenta y la pantalla principal no se enteraría de un guardado hecho en
 * `settings.tsx`. El provider vive en la raíz (`_layout.tsx`) y carga los
 * ajustes antes del primer render de las rutas.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { DEFAULT_SETTINGS, type Settings } from '@/domain/settings';
import {
  loadSettings,
  resetSettings,
  saveSettings,
} from '@/storage/settingsStore';

export interface SettingsContextValue {
  /** Ajustes vigentes para toda la app. */
  settings: Settings;
  /** `false` mientras se leen del dispositivo. */
  ready: boolean;
  /** Guarda y propaga los ajustes ya validados (RF-1). */
  save: (settings: Settings) => Promise<void>;
  /** Restablece y persiste los valores por defecto (RF-4); devuelve los aplicados. */
  reset: () => Promise<Settings>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);
  // Último valor confirmado, para revertir si falla la escritura.
  const settingsRef = useRef<Settings>(DEFAULT_SETTINGS);

  const commit = useCallback((next: Settings) => {
    settingsRef.current = next;
    setSettings(next);
  }, []);

  // Se cargan una sola vez, antes de dar por listo el estado (RF-6, RF-7).
  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      const stored = await loadSettings();
      if (cancelled) {
        return;
      }
      setSettings(stored);
      settingsRef.current = stored;
      setReady(true);
    };

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, []);

  // El estado se actualiza **antes** de escribir en disco: así la pantalla
  // principal y el formulario ven el cambio de inmediato y no dependen de
  // cuándo termine el almacenamiento. Si la escritura falla, se revierte
  // el estado y se propaga el error.
  const save = useCallback(
    async (next: Settings) => {
      const previous = settingsRef.current;
      commit(next);
      try {
        await saveSettings(next);
      } catch (error) {
        commit(previous);
        throw error;
      }
    },
    [commit],
  );

  const reset = useCallback(async () => {
    const restored = DEFAULT_SETTINGS;
    const previous = settingsRef.current;
    commit(restored);
    try {
      await resetSettings();
    } catch (error) {
      commit(previous);
      throw error;
    }
    return restored;
  }, [commit]);

  const value = useMemo(
    () => ({ settings, ready, save, reset }),
    [settings, ready, save, reset],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

/** Acceso a los ajustes compartidos. Falla si falta el provider. */
export function useSettingsContext(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (context === null) {
    throw new Error(
      'useSettingsContext debe usarse dentro de <SettingsProvider>',
    );
  }
  return context;
}
