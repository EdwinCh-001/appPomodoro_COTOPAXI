# Tareas — Spec 005 Configuración

Depende de las specs 001–003. Una tarea cada vez: pruebas en rojo → código → `npx jest` en verde → parar.

- [x] **T1. Validación pura con pruebas.** Crear `src/domain/settings.ts` (defaults, rangos en constante única con estudio 1–60, `parseSettingsInput`, `validateSettings`) con pruebas en rojo: inválidos (vacío, cero, negativo, no numérico, fuera de rango), límites exactos y defaults. RF-2, RF-3, RF-7 — *Hecho 2026-10-20: `src/domain/settings.ts` con `DEFAULT_SETTINGS` (25/5/15/4), `RANGES` (estudio 1–60 por enmienda del 2026-10-19), `parseSettingsInput`, `validateSettings`, `isSettings`, `settingsToInput`, `settingsToDurations`; 12 pruebas en verde.*
  - Hecho cuando: `npx jest` en verde cubriendo los 4 grupos de pruebas del plan.
- [x] **T2. Almacén propio de ajustes con pruebas.** Crear `src/storage/settingsStore.ts` (clave `settings@v1`, cargar/guardar/restablecer con fallback a defaults). RF-6, RF-7 — *Hecho 2026-10-20: `src/storage/settingsStore.ts` con `saveSettings`, `loadSettings` (valida rango/forma) y `resetSettings`; 8 pruebas con AsyncStorage mockeado en verde. Clave separada del snapshot de sesión (decisiones 005 #8).*
  - Hecho cuando: las pruebas cubren guardar→cargar idéntico, clave ausente → defaults y clave ilegible → defaults sin lanzar.
- [x] **T3. Pantalla de ajustes.** Crear `src/app/settings.tsx` con campos numéricos, mensajes inline en español, botón "Guardar ajustes" y navegación; teclado sin tapar nada; paleta Cotopaxi y etiquetas de accesibilidad. RF-1, RF-3, RNF-2, RNF-3 — *Hecho 2026-10-20: `src/app/settings.tsx` con 4 campos `keyboardType="number-pad"` en `ScrollView` con `keyboardShouldPersistTaps="handled"`, mensajes inline `#D33724`, acceso desde el encabezado de `index.tsx`. Ruta `/settings` confirmada registrada por `expo export`.*
  - Hecho cuando: en Expo Go se cambia un tiempo, se guarda, aparecen mensajes de error al inválido y el teclado no tapa campos ni botones.
- [x] **T4. Restablecer con confirmación.** Añadir "Restablecer valores por defecto" con `Alert` que restaura 25/5/15/4 sin tocar la sesión en curso. RF-4, RF-8 — *Hecho 2026-10-20: botón con `Alert` (Cancelar/Restablecer) que llama a `reset()` del hook; solo toca los ajustes, la sesión queda intacta (prueba en `settingsFlow.test.ts`).*
  - Hecho cuando: en Expo Go, cancelar no cambia nada y confirmar restaura y persiste los defaults.
- [x] **T5. Cambios desde la siguiente fase.** Hook `useSettings` consumido por el timer y el ciclo: la fase en curso conserva su duración; los nuevos ajustes aplican en la siguiente. RF-5, RF-1 — *Hecho 2026-10-20: `src/hooks/useSettings.ts` nuevo (carga antes del primer render, `save`, `reset`); `index.tsx` deriva las duraciones con `settingsToDurations` y las pasa a `useTimer`. RF-5 resuelto **sin effects**: si la fase está `ready` adopta las duraciones nuevas en el render, si está `running`/`paused` conserva `durationSeconds` y los ajustes aplican al preparar la siguiente fase.*
  - Hecho cuando: en Expo Go, con un estudio corriendo se cambia el estudio a 10 min, la fase activa pasa a esperar Iniciar con 10 min y el siguiente usa 10 min (RF-5 enmendado 2026-10-20).
- [x] **T6. Verificación de cierre.** Lista manual en Expo Go ejecutada por el usuario (cambiar y persistir tras cerrar, valor inválido, restablecer, cambio con fase en curso) + `npx jest`, `npx tsc --noEmit`, `npm run lint` en verde. RF-1..RF-8
  - Hecho cuando: comandos en verde y el usuario confirma los 4 escenarios; la spec pasa a `implementada` solo con su aprobación.
  - *Hecho 2026-10-20: `tsc` exit 0, `jest --preset jest-expo` en verde, `expo lint` limpio; el usuario confirmó el comportamiento en Expo Go y pidió dar la spec por cerrada. **Spec 005 marcada como `implementada`.***

## Enmienda 2026-10-20 (decisión del usuario)

Guardar o restablecer ajustes ahora **reinicia el ciclo de cero**: contador de pomodoros en 0, fase de estudio preparada con la duración y el objetivo nuevos, esperando que el usuario pulse Iniciar (revierte la decisión 5 y concreta la 6). Las fases siguientes siguen avanzando solas; solo la primera fase del ciclo nuevo requiere Iniciar. Implementado en `applySessionSettings` (`src/domain/session.ts`) y cubierto por `src/domain/__tests__/settingsApply.test.ts` y `settingsFlow.test.ts`. Ver `decisiones.md` y `spec.md` (RF-1, RF-4, RF-5, RF-8).

## Corrección 2026-10-20 (decisión del usuario)

El usuario corrige la enmienda anterior (era un error suyo): **la fase actual termina con el tiempo con el que empezó y el cambio se aplica a la siguiente.** Se revierte el reinicio del ciclo:

- La fase `running`/`paused` conserva su reloj (`durationSeconds`, `endAt`, `remainingSeconds`); el contador y el progreso se mantienen.
- Solo cambia 'pomodoros por ciclo': se mantiene todo y cambia solo el objetivo.
- Una fase `ready` (sin iniciar) sí adopta la duración nueva, porque no tiene un tiempo "con el que empezó".
- `applySessionSettings` ya no llama a `createSession`: solo sustituye `durations` y `targetPomodoros` (y el reloj si está `ready`).

Cubierto por `settingsApply.test.ts` (13 pruebas) y `settingsFlow.test.ts` (7 pruebas), reescritas para el criterio corregido. Ver `decisiones.md` (corrección 2026-10-20) y `spec.md` (RF-1, RF-4, RF-5, RF-8).
