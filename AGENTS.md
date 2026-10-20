# AGENTS.md — Pomodoro Academia Cotopaxi

App móvil offline para el colegio "Academia Cotopaxi" (Pomodoro). Proyecto didáctico, sin anuncios/registro/backend.

## Stack
- Expo ~57, React 19.2.3, React Native 0.86.3, TypeScript ~6 (strict). Entry: `expo-router/entry` (file-based routing).
- Aliases: `@/*` -> `./src/*`, `@/assets/*` -> `./assets/*` (ver `tsconfig.json`).
- Persistencia local con `@react-native-async-storage/async-storage` cuando se implemente.

## Estructura real
Expo Router: las rutas están actualmente en src/app/. No crear una segunda carpeta app/ en la raíz ni mover rutas sin una tarea aprobada que lo requiera.
src/domain/: lógica de negocio pura, sin React ni AsyncStorage.
src/storage/: persistencia local.
Pruebas junto al módulo que prueban, usando __tests__/ o archivos *.test.ts(x), según la convención definida para la tarea.
La estructura puede evolucionar mediante tareas aprobadas; no crear carpetas anticipadamente sin necesidad.

## Comandos (verificados)
- Instalar: `npm install`
- Dev: `npx expo start` (red bloqueada: `npx expo start --tunnel`). Plataformas: `npm run android|ios|web`
- Lint: `npm run lint` (usa `expo lint`)
- Tipos: `npx tsc --noEmit`
- Tests: `npx jest` o `npx jest --preset jest-expo` (Jest 30, `jest-expo`). Con PowerShell usar `npx.cmd`. No hay script `test` en `package.json`.

## Convenciones
- Código/nombres en inglés; textos de interfaz/comentarios en español.
- Reglas Pomodoro/timer: fuente de verdad en skill `pomodoro-rules`. Decisiones/validación en `specs/NNN-*/decisiones.md`.
- Marca/contraste: skill `cotopaxi-brand`. Trampas RN: skill `rn-conventions`.
- Antes de tocar código lee `docs/constitution.md` y la spec activa `specs/NNN-*/`.
- Muestra plan, una tarea por vez. Pregunta si hay duda.
- Pruebas primero para lógica; textos en español.
- Pregunta antes: instalar dependencias, crear archivos fuera del plan, cambiar formato de datos guardados.
- Nunca reemplazar archivos existentes sin que la tarea lo pida, ni guardar datos sensibles.

## Memoria
- Al empezar lee `MEMORY.md`. Al terminar fase/tarea actualiza solo "Estado actual" y "Próximos pasos" (con siguiente `/sdd-*`).
- No copies decisiones/contenido de specs a `MEMORY.md`; remite a `specs/NNN-*/decisiones.md`. Sin detalles de implementación. Máx ~50 líneas.

## Verificación
- Lógica: `npx jest` en verde. Interfaz: lista manual en Expo Go/dispositivo según tarea.
