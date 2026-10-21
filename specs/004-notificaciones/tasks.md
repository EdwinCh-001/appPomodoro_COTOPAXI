# Tareas — Spec 004 Notificaciones

Depende de las specs 001–003. **T1 requiere aprobación explícita del usuario** para instalar dependencias (AGENTS.md). Una tarea cada vez: pruebas en rojo → código → `npx jest` en verde → parar.

- [x] **T1. Aprobar e instalar dependencias.** Instalar `expo-notifications` y `expo-audio` con `npx expo install`, previa confirmación del usuario. RF-1, RF-3 — *Hecho 2026-10-19: instaladas (`expo-notifications@~57.0.23`, `expo-audio@~57.0.5`), `tsc` y `lint` en verde, arranque en Expo Go confirmado por el usuario. Lista blanca actualizada con enmienda en `specs/006-funcionamiento-offline/decisiones.md`.*
  - Hecho cuando: `package.json` las incluye, la app arranca sin errores en Expo Go y la lista blanca de decisiones 006 #2 queda actualizada con estos dos paquetes.
- [x] **T2. Lógica pura del aviso con pruebas.** Crear `src/domain/notice.ts` (`noticeContent`, `shouldAskPermission`, `shouldPlayInAppAlarm`, `alarmVibrationPattern`) con pruebas en rojo. RF-1, RF-3, RF-5, RF-6, RF-8
  - Hecho cuando: `npx jest` en verde con los 4 grupos de pruebas del plan y los textos exactos en español.
  - *Hecho 2026-10-20: `src/domain/notice.ts` + `notice.test.ts` (16 pruebas). Títulos/cuerpos en español, `shouldAskPermission`, `shouldPlayInAppAlarm`, `alarmVibrationPattern`, `noticeIdFor` y `ALARM_CHANNEL_ID`.*
- [x] **T3. Permisos de notificaciones.** Crear `src/notifications/permissions.ts`; pre-permission explicativo antes del primer Iniciar; solicitud una sola vez; modo degradado con enlace "Revisar permiso" (contenido definido para la pantalla de ajustes de la spec 005). RF-5, RF-6, RNF-3
  - Hecho cuando: en Expo Go se explica antes de pedir, se pide una vez, y al denegar la app sigue funcionando y el enlace abre los ajustes del sistema.
  - *Hecho 2026-10-20: `permissions.ts` (estado normalizado, canal Android, `requestPermission`, `openSystemSettings`); pre-permission en `index.tsx`; "Revisar permiso" en `settings.tsx`. Pendiente confirmar en Expo Go (T6).*
- [x] **T4. Programación y cancelación del aviso.** Crear `src/notifications/scheduler.ts` e integrarlo en `useTimer`: programar al iniciar fase, cancelar/reprogramar al pausar, reiniciar u omitir. RF-1, RF-2, RF-7
  - Hecho cuando: en Expo Go, cerrando la app con una fase en curso se recibe la notificación en el momento exacto; al pausar no llega ninguna.
  - *Hecho 2026-10-20: `scheduler.ts` (handler, `schedulePhaseEnd`, `cancelPhaseEnd`, `cancelAllPhaseEnds`, `dismissDeliveredPhaseEnds`) integrado en `useTimer` por efecto sobre el estado en curso. Pendiente confirmar en Expo Go (T6).*
- [x] **T5. Alarma in-app.** Crear `src/notifications/inAppAlarm.ts` (sonido `expo-audio` + vibración `Vibration` con patrón compartido) y conectarla al fin de fase con la app abierta; silenciar al tocar la notificación o al interactuar con la app. RF-3, RF-4, RF-8
  - Hecho cuando: en Expo Go con el celular en silencio y la app abierta suena y vibra al terminar la fase, y al tocar la notificación o la app se silencia mostrando la siguiente fase.
  - *Hecho 2026-10-20: `inAppAlarm.ts` con `assets/sounds/alarm.wav` generado; `useNotifications` orquesta permiso + alarma; `index.tsx` silencia en cada interacción y al volver al primer plano. Pendiente confirmar en Expo Go (T6).*
- [x] **T6. Verificación de cierre.** Lista manual en Expo Go ejecutada por el usuario (aviso con app abierta, aviso con app cerrada, silencio con app abierta, denegar permiso, tocar notificación, pausar sin aviso) + `npx jest`, `npx tsc --noEmit`, `npm run lint` en verde. RF-1..RF-8
  - Hecho cuando: comandos en verde y el usuario confirma los 6 escenarios; la spec pasa a `implementada` solo con su aprobación.
  - *Hecho 2026-10-20: el usuario confirmó la lista de escenarios en Expo Go y pidió dar la spec por cerrada. **Spec 004 marcada como `implementada`.***
  - *Corrección 2026-10-20 (bug de arranque): importar el barril `expo-notifications` crasheaba la app en Expo Go (`Cannot find native module 'ExpoTopicSubscriptionModule'`). T3/T4 ahora importan submódulos concretos; ver decisión 004 #9. Bundle verificado sin el módulo problemático.*
