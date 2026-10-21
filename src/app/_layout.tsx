import { Slot } from 'expo-router';
import { SettingsProvider } from '@/hooks/settingsContext';

export default function RootLayout() {
  // Los ajustes viven en la raíz: todas las rutas ven el mismo estado.
  return (
    <SettingsProvider>
      <Slot />
    </SettingsProvider>
  );
}
