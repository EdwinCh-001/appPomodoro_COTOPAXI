# MEMORY.md — Pomodoro Academia Cotopaxi

## Estado actual
- Constitución, AGENTS.md e historias (HU-001 a HU-006) definidas.
- Entrevista grill-me completada (8 preguntas por HU, correcciones en HU-002) y `decisiones.md` escritos en `specs/001` … `specs/006`.
- `spec.md`, `plan.md` y `tasks.md` generados en las 6 specs; las **6 specs (001–006) están `implementada`**.
- T1 de `specs/004-notificaciones/tasks.md` cerrada (dependencias instaladas y arranque confirmado en Expo Go).
- T1 de `specs/001-temporizador/tasks.md` cerrada: `src/domain/timer.ts` y `format.ts` con 14 pruebas Jest en verde; `"types": ["jest"]` añadido al `tsconfig.json`.
- T2 de `specs/001-temporizador/tasks.md` cerrada: `src/hooks/useTimer.ts` (tick por diferencia de fechas, expone `start/pause/resume/reset`, sin persistencia).
- T3 de `specs/001-temporizador/tasks.md` cerrada: pantalla principal, `TimerDisplay` y `TimerControls` con paleta Cotopaxi; verificada por el usuario en Expo Go.
- T4 de `specs/001-temporizador/tasks.md` cerrada: `tsc`, `jest --preset jest-expo` (14/14) y `expo lint` en verde + listas manuales confirmadas por el usuario en Expo Go. **Spec 001 marcada como `implementada`.**
- T1–T5 de `specs/002-ciclos-pomodoro/tasks.md` cerradas: `src/domain/cycle.ts`, `session.ts` y `labels.ts` nuevos; `useTimer` aplica la transición de ciclo; `CycleIndicator` y botón "Omitir" en descansos. **Spec 002 marcada como `implementada`** (42/42 pruebas, `tsc` y `lint` limpios; verificado por el usuario en Expo Go).
- T1–T4 de `specs/003-persistencia-sesion/tasks.md` cerradas: `src/domain/reconcile.ts` y `src/storage/sessionSnapshot.ts` nuevos; `useTimer` hidrata (cargar → reconciliar → persistir) y guarda en transiciones y ≤1 vez/s. **Spec 003 marcada como `implementada`** (64/64 pruebas; los 5 escenarios confirmados en Expo Go).
- T1–T5 de `specs/005-configuracion/tasks.md` implementadas: ajustes compartidos y persistidos, pantalla `settings.tsx`. **Spec 005 marcada como `implementada`** (T6 confirmada por el usuario en Expo Go, 2026-10-20).
- Enmienda 2026-10-20 a la spec 002 (decisión del usuario): la siguiente fase arranca sola y "Reiniciar" solo aparece en estudio. Registrada en `specs/002-ciclos-pomodoro/decisiones.md`, `spec.md` y `tasks.md` (T6, T7).
- Enmienda 2026-10-20 a la spec 002 — fin de sesión: al terminar el descanso largo la sesión queda "terminada" con un botón "Terminar sesión" que devuelve a la fase 1 esperando Iniciar; el estado se persiste. Registrada en `specs/002` (RF-10..RF-13, T8–T10) y `specs/003` (RF-9). Implementado en `session.ts`, `reconcile.ts`, `useTimer.ts` y `TimerControls.tsx`. **Confirmada por el usuario en Expo Go (2026-10-20).**
- T2–T5 de `specs/004-notificaciones/tasks.md` implementadas: `src/domain/notice.ts` (lógica pura + 16 pruebas), `src/notifications/{permissions,scheduler,inAppAlarm}.ts`, hook `useNotifications` y aviso en `index.tsx`/`settings.tsx`; sonido propio `assets/sounds/alarm.wav`. T6 confirmada por el usuario en Expo Go (2026-10-20). **Spec 004 marcada como `implementada`.**
- Corrección 2026-10-20 (bug de arranque en Expo Go): importar `expo-notifications` completo crasheaba la app por un módulo nativo ausente en el binario de Expo Go; `permissions.ts`/`scheduler.ts` ahora importan submódulos concretos (decisión 004 #9). La app vuelve a arrancar.
- T1–T4 de `specs/006-funcionamiento-offline/tasks.md` hechas: bienvenida de primera apertura (`Welcome.tsx` + `welcomeFlag.ts`) y auditorías de dependencias/red y de datos/permisos (documentadas en `tasks.md`; se corrigió el inventario del plan: son 3 claves, no 4). 141/141 pruebas, `tsc` y `lint` en verde; T4 confirmada por el usuario en Expo Go (2026-10-20). **Spec 006 marcada como `implementada`.**
- Enmienda 2026-10-20 a la spec 005 (decisión del usuario): la app no muestra el aviso emergente de "fase terminada". Guardar/restablecer actualizan el estado en memoria **antes** de escribir en disco y el formulario refresca sus campos en el mismo toque. Implementado en `settingsContext.tsx` y `settings.tsx`.
- Corrección 2026-10-20 a la spec 005 (decisión del usuario): guardar o restablecer ajustes **no reinicia el ciclo**. La fase en curso conserva el tiempo con el que empezó y el contador se mantiene; los ajustes nuevos rigen desde la fase siguiente (una fase `ready` sí adopta la duración nueva). Revierte la enmienda del mismo día que reiniciaba el ciclo a cero. Implementado en `applySessionSettings` y cubierto por `settingsApply.test.ts` y `settingsFlow.test.ts`.
- La HU-007 (historial de sesiones) y su spec 007 se eliminaron el 2026-10-20 por decisión del usuario; se revirtieron las enmiendas que habían dejado en las specs 003 y 006 (sin historial de ciclos).

## Pendientes anotados (no pertenecen a las specs cerradas)
- Alinear `app.json` con la paleta Cotopaxi: splash/íconos con colores de plantilla (`#208AEF`, `#E6F4FE`) y revisar `"orientation": "portrait"`. Requiere spec propia o enmienda aprobada por el usuario.

## Decisiones (y por qué)
- Ver `specs/NNN-*/decisiones.md`, una por HU; las correcciones de la entrevista y enmiendas del usuario quedan señaladas allí.

## Próximos pasos
- Las 6 specs (001–006) están `implementada`. Siguiente paso sugerido: preparar el primer commit de git (todo el trabajo está sin confirmar).