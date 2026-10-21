# Plan — Spec 004 Notificaciones

Plan técnico para `specs/004-notificaciones/spec.md`. Decisiones: `specs/004-notificaciones/decisiones.md`. Depende de las specs 001–003.

## Dependencias (requieren aprobación antes de instalar — AGENTS.md)

| Paquete | Para qué | Alternativa descartada |
|---|---|---|
| `expo-notifications` | Notificación local programada en el timestamp de fin de fase. | Programar sin librería es imposible en Expo Go. |
| `expo-audio` | Alarma in-app (sonido) que no depende del modo silencio con la app en primer plano. | `expo-av` está deprecado desde SDK 54; `Vibration` de RN no produce sonido. |

La vibración usa `Vibration` de React Native (incluida, sin dependencia nueva). La instalación se hace con `npx expo install` y solo tras confirmación del usuario.

## Archivos y responsabilidades

| Archivo | Responsabilidad | RF |
|---|---|---|
| `src/domain/notice.ts` | Funciones puras: texto del aviso por fase, gating de permiso, decisión de alarma in-app, id de la notificación de la fase. | RF-1, RF-3, RF-6, RF-8 |
| `src/domain/__tests__/notice.test.ts` | Pruebas Jest de las funciones puras. | RNF (Constitución #6) |
| `src/notifications/scheduler.ts` | Programar/cancelar la notificación local con trigger en el timestamp de fin (`scheduleNotificationAsync` + trigger por fecha). | RF-1, RF-2, RF-7 |
| `src/notifications/permissions.ts` | Consultar/solicitar permiso; exponer estado para el modo degradado. | RF-5, RF-6, RNF-3 |
| `src/notifications/inAppAlarm.ts` | Reproducir sonido (`expo-audio`) + vibración (`Vibration`) al terminar una fase con la app en primer plano; silenciar al interactuar. | RF-3, RF-8 |
| `src/hooks/useTimer.ts` (ampliación) | Al iniciar fase: programar notificación y preparar alarma; al pausar/reiniciar/omitir: cancelar y reprogramar; al terminar con la app abierta: disparar alarma in-app. | RF-2, RF-3, RF-7 |
| `src/app/index.tsx` | Pre-permission (diálogo explicativo) antes del primer Iniciar; detección de apertura desde notificación. | RF-4, RF-5 |
| `src/app/settings.tsx` (toque) | Enlace "Revisar permiso" cuando está denegado (pantalla completa en la spec 005; aquí solo queda definido el contenido). | RF-6 |

## Funciones puras (src/domain/notice.ts)

- `noticeContent(phaseKind)` → `{ title, body }` en español, p. ej. estudio → "¡Estudio terminado! Toca para iniciar el descanso corto".
- `shouldAskPermission(firstStart, permissionStatus)` → `true` solo en el primer inicio sin permiso (RNF-3: no insiste).
- `shouldPlayInAppAlarm(appState, phaseJustFinished)` → solo con la app en primer plano y una fase recién terminada.
- `alarmVibrationPattern()` → patrón constante compartido por notificación y alarma (RF-8).

## Algoritmo en pseudocódigo (programación del aviso)

```
al iniciar una fase en curso (running):
  cancelar notificación previa si existe
  id = scheduleNotificationAsync(trigger = endAt, content = noticeContent(fase))
  si app en primer plano: preparar sonido de alarma in-app

al pausar / reiniciar / omitir:
  cancelar notificación(id)
  si la fase continúa: reprogramar con el nuevo endAt

al terminar la fase:
  si app abierta (foreground): inAppAlarm.play() + Vibration.vibrate(pattern)
  al tocar notificación o abrir la app: inAppAlarm.stop(); mostrar siguiente fase preparada
```

La programación usa marcas de tiempo del sistema, coherente con RNF-1 de la spec 003.

## Decisiones justificadas

- **Híbrido (notificación + alarma in-app)** vs solo notificación: en Expo Go una notificación no puede forzar sonido con el sistema en silencio; la alarma in-app cubre el criterio "suena como alarma" al menos con la app en primer plano (decisiones 004 #1; la variante nativa queda como mejora futura).
- **Solicitar permiso al primer Iniciar con explicación previa** vs al abrir la app: la HU lo pide al iniciar un temporizador y evita fricción con la llegada directa al timer (decisiones 004 #2; HU-006).
- **Modo degradado con enlace** vs reintentar o bloquear: insistir es invasivo y bloquear iría contra HU-006 (decisiones 004 #3).
- **Programar por fase** vs todas las fases del ciclo de una vez: el estudiante puede pausar, reiniciar u omitir; reprogramar mantiene la notificación siempre alineada al fin real (decisiones 004 #6).
- **`Vibration` de RN** vs `expo-haptics`: se necesita un patrón de vibración repetido (alarma), que `expo-haptics` no ofrece; RN ya está incluida.

## Estrategia de pruebas con Jest

`src/domain/__tests__/notice.test.ts` (puras, sin dispositivo):

1. `noticeContent` para las tres fases: títulos y cuerpos exactos en español.
2. `shouldAskPermission`: solo primer inicio sin permiso; no vuelve a pedir tras denegar.
3. `shouldPlayInAppAlarm`: true solo con app en primer plano y fase recién terminada.
4. `alarmVibrationPattern`: patrón constante.

Las interacciones con `expo-notifications` y `expo-audio` se verifican con la lista manual en Expo Go (no se mockea el módulo nativo en esta spec).
