# Decisiones — 004-notificaciones (HU-004)

- **Fecha:** 2026-10-19
- **Historia:** HU-004 — Recibir aviso al terminar el tiempo
- **Origen:** Entrevista grill-me (8 preguntas, sin correcciones)
- **Riesgo de la HU:** Alto

## Decisiones

1. **Estrategia híbrida para el criterio "suena como alarma en silencio":** notificación local con sonido/vibración según el volumen del sistema **y, cuando la app está en primer plano, alarma in-app (audio + haptics) que no depende del modo silencio**.
   *Limitación documentada:* en Expo Go una notificación no puede forzar sonido con el volumen en silencio. La variante nativa (`USAGE_ALARM` con development build) queda como mejora futura, no exigida para esta spec.
2. **Permiso de notificaciones: se solicita al primer "Iniciar" del temporizador,** precedido de una explicación en español de para qué se necesita (pre-permission antes del diálogo del sistema). Cumple el criterio de la HU sin fricción en el primer arranque (HU-006).
3. **Permiso denegado: modo degradado.** La app funciona igual; con ella abierta se avisa visualmente y con alarma in-app. Ajustes incluye un enlace "Revisar permiso". Nunca se bloquea el uso del temporizador.
4. **Contenido de la notificación: título con la marca Cotopaxi y cuerpo dinámico en español** con llamado a la acción, p. ej. "¡Estudio terminado! Toca para iniciar el descanso corto".
5. **Detener el aviso: tocar la notificación abre la app, silencia sonido/vibración y muestra la siguiente fase lista** (criterio textual: "la aplicación se abre mostrando la siguiente fase").
6. **Programación: al pasar a `running` se agenda la notificación con trigger en el timestamp de fin;** al pausar, reiniciar u omitir se cancela y se reprograma. Coherente con HU-003 P4.
7. **Vibración: patrón constante y distintivo,** el mismo en la notificación y en la alarma in-app.
8. **Compatibilidad: Expo Go es suficiente con el enfoque híbrido;** no se exige development build para esta spec.
9. **Importación por submódulos, no por el paquete completo (corrección 2026-10-20).** En Android + Expo Go, importar `expo-notifications` (el barril `index.js`) **revienta la app al arrancar** con `Cannot find native module 'ExpoTopicSubscriptionModule'`: el barril lo reexporta de forma estática y el binario de Expo Go 57.0.9 no incluye ese módulo nativo (el arreglo de `57.0.23` solo cubrió otro archivo, `DevicePushTokenAutoRegistration.fx`). Por eso `permissions.ts` y `scheduler.ts` importan **rutas concretas** (`expo-notifications/build/NotificationPermissions`, `.../scheduleNotificationAsync`, etc.), que solo cargan módulos presentes en Expo Go (`ExpoNotificationScheduler`, `ExpoNotificationPermissionsModule`, `ExpoNotificationsHandlerModule`, `ExpoNotificationPresenter`). Verificado: el bundle ya no contiene `ExpoTopicSubscriptionModule`. *Alcance:* solo notificaciones **locales**; las remotas/push siguen siendo territorio de development build.

## Riesgos y notas

- El criterio "suena en silencio" queda cumplido **solo con la app en primer plano** en Expo Go; fuera de eso depende del volumen del sistema. Este matiz debe constar en la spec para no dar por cumplido algo parcial.
- Notificaciones locales pueden ser aplazadas por el gestor de batería del Android en equipos agresivos (riesgo aceptado; ver HU-006 decisión 4).
- **No volver a importar `expo-notifications` como paquete completo** mientras la verificación se haga en Expo Go: reintroduce el fallo de la decisión 9. Si en el futuro se adopta un development build, la restricción deja de aplicar.
