# Tareas — Spec 006 Funcionamiento offline

Va de último: audita lo construido por las specs 001–005. Una tarea cada vez; las de interfaz esperan confirmación del usuario en Expo Go.

- [x] **T1. Pantalla de bienvenida.** Crear `src/components/Welcome.tsx` (identidad Cotopaxi, en español, botón "Empezar", sin campos) y `src/storage/welcomeFlag.ts`; `index.tsx` muestra bienvenida solo en la primera apertura y siempre tras borrar datos. RF-1, RF-2, RF-9, RNF-2
  - Hecho cuando: en Expo Go la primera apertura muestra la bienvenida, un toque en "Empezar" llega al temporizador, no se vuelve a mostrar y tras borrar los datos de la app reaparece.
  - *Hecho 2026-10-20: `welcomeFlag.ts` (`welcomeSeen`) + `welcomeFlag.test.ts` (7 pruebas); `Welcome.tsx`; `index.tsx` decide la pantalla y marca la bandera al pulsar "Empezar". `tsc`, `lint` y jest (140/140) en verde. Pendiente confirmar en Expo Go (T4).*
- [x] **T2. Auditoría de dependencias y red.** Revisar `package.json` contra la lista blanca del plan (sin SDKs de publicidad, analítica, auth ni *crash reporting*) y buscar peticiones de red (`fetch`, URLs `http`) en `src/`. RF-5, RF-8, RNF-3
  - Hecho cuando: la revisión queda documentada en esta spec (añadir la fecha y el resultado al final de este archivo) y no aparecen paquetes ni peticiones prohibidas; si aparecen, se elimina lo que no esté aprobado.
  - *Hecho 2026-10-20: sin peticiones de red en `src/` y sin SDKs prohibidos; resultado documentado en la auditoría al final de este archivo.*
- [x] **T3. Inventario de datos y permisos.** Verificar que AsyncStorage usa únicamente las 4 claves aprobadas (`settings@v1`, `session@v1`, `welcomeSeen`, `notificationPermissionAsked`) y que el único permiso solicitado es notificaciones. RF-6, RF-7
  - Hecho cuando: la búsqueda en el código confirma las claves y permisos, y el resultado queda documentado junto al de la T2.
  - *Hecho 2026-10-20: 3 claves reales (`settings@v1`, `session@v1`, `welcomeSeen`) y un único permiso de usuario (notificaciones); `notificationPermissionAsked` no existe en el código (desfase del plan, corregido). Ver auditoría al final de este archivo.*
- [x] **T4. Verificación de cierre.** Lista manual en Expo Go ejecutada por el usuario: primera apertura en modo avión, uso completo sin conexión, sin publicidad en ninguna pantalla + `npx jest`, `npx tsc --noEmit`, `npm run lint` en verde. RF-1..RF-9
  - Hecho cuando: comandos en verde y el usuario confirma los 3 escenarios; la spec pasa a `implementada` solo con su aprobación.
  - *Hecho 2026-10-20: el usuario confirmó los 3 escenarios en Expo Go y pidió dar la spec por cerrada. **Spec 006 marcada como `implementada`.***

## Auditoría 2026-10-20 — resultado de T2 y T3

**T2 — Dependencias y red (RF-5, RF-8, RNF-3).**

- `src/` no contiene ninguna petición de red: la búsqueda de `fetch(`, `axios`, `XMLHttpRequest`, `WebSocket` y URLs `http(s)://` **no devuelve resultados**.
- Paquetes **realmente importados** por `src/`: `expo-router`, `expo-status-bar`, `expo-audio`, `expo-notifications`, `@react-native-async-storage/async-storage`, `react-native`, `react-native-safe-area-context`. Todos están en la lista blanca del plan.
- **Sin SDKs prohibidos:** no hay publicidad, analítica, autenticación ni *crash reporting*.
- Observación (no bloqueante): `package.json` conserva dependencias de la plantilla que **ningún archivo de `src/` importa** (`@expo/ui`, `expo-constants`, `expo-device`, `expo-glass-effect`, `expo-image`, `expo-linking`, `expo-symbols`, `expo-system-ui`, `expo-web-browser`, `expo-font`, `expo-splash-screen` — las dos últimas sí las usa `app.json` vía plugins). No incumplen la lista blanca; su retirada queda como limpieza opcional futura que requiere una tarea aprobada.

**T3 — Inventario de datos y permisos (RF-6, RF-7).**

Claves en AsyncStorage, verificadas en `src/storage/`:

| Clave | Archivo | Uso |
|---|---|---|
| `settings@v1` | `settingsStore.ts` | Ajustes (spec 005). |
| `session@v1` | `sessionSnapshot.ts` | Snapshot de sesión (spec 003). |
| `welcomeSeen` | `welcomeFlag.ts` | Bandera de bienvenida (spec 006, T1). |

- Único permiso **solicitado al usuario**: notificaciones (`permissions.ts` → `requestPermissionsAsync`). No se piden contactos, ubicación, cámara, micrófono ni almacenamiento externo.
- `app.json` declara además `SCHEDULE_EXACT_ALARM`: es un permiso **de sistema** (no se muestra al usuario) necesario para que la notificación programada llegue a la hora exacta en Android 12+; no contradice RF-7.
- **Desfase plan↔implementación:** el plan listaba una 4.ª clave `notificationPermissionAsked`, pero la spec 004 mantiene ese estado **solo en memoria** (`startedOnceRef`) y nunca lo persiste. Se corrige el plan para reflejar la implementación real; no se añade código en esta spec.
