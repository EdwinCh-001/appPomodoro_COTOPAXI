# Plan Técnico — Spec 005: Ajustes y Configuración

## Archivos y responsabilidades
- `src/domain/settings.ts`: Funciones puras para validar rangos de tiempo (estudio, descansos) y cantidad de pomodoros.
- `src/domain/__tests__/settings.test.ts`: Pruebas unitarias con Jest para la validación de configuraciones.
- `src/storage/settings-storage.ts`: Persistencia local de las preferencias del usuario mediante `@react-native-async-storage/async-storage`.
- `src/app/(tabs)/settings.tsx`: Pantalla de ajustes con formulario de entrada, validación en vivo y botón de restablecer valores por defecto.

## Estrategia de pruebas
Pruebas de dominio con Jest para límites numéricos y valores inválidos, y pruebas de persistencia en AsyncStorage.