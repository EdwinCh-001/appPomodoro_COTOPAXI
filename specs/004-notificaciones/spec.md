# Spec 004 — Avisos de fin de fase

Estado: implementada
HU de origen: docs/historias/HU-004.md

## Contexto y objetivo

El estudiante quiere cambiar de actividad sin mirar la pantalla: cuando termina un estudio o un descanso debe enterarse aunque el celular esté en silencio o la app esté cerrada. Esta spec define el aviso (notificación y alarma), el permiso que requiere y cómo se detiene.

## Usuarios

- Estudiante que tiene el celular en la mesa o en el bolsillo, con sonido activado, en vibración o en silencio, y con la app abierta o cerrada.

## Historias de usuario

- HU-004 — Recibir aviso al terminar el tiempo (4 escenarios: aviso con sonido, aviso en silencio, detener el aviso, permiso de notificaciones).

## Definiciones

- **Aviso:** notificación del sistema que indica qué fase terminó.
- **Alarma in-app:** sonido y vibración producidos por la app misma mientras está en primer plano, sin depender del volumen de notificaciones del sistema.
- **Modo degradado:** funcionamiento con el permiso de notificaciones denegado: avisos visuales y alarma in-app con la app abierta; sin notificación del sistema.

## Requisitos funcionales

- RF-1: CUANDO una fase llega a cero, EL SISTEMA emite un aviso que identifica qué fase terminó (estudio, descanso corto o descanso largo). Origen: HU-004 esc. "Aviso con el celular en sonido"; decisiones 004 #4.
- RF-2: MIENTRAS el celular tiene el sonido activado y el permiso concedido, EL SISTEMA entrega el aviso con sonido y vibración. Origen: HU-004 esc. "Aviso con el celular en sonido"; decisiones 004 #7.
- RF-3: MIENTRAS el celular está en modo silencio y la app está en primer plano, EL SISTEMA emite una alarma in-app (sonido y vibración) que no depende del modo de silencio del sistema. Origen: HU-004 esc. "Aviso con el celular en silencio"; decisiones 004 #1.
- RF-4: CUANDO el estudiante toca la notificación, EL SISTEMA abre la app, detiene el aviso y muestra la siguiente fase preparada. Origen: HU-004 esc. "Detener el aviso"; decisiones 004 #5.
- RF-5: CUANDO el estudiante inicia un temporizador por primera vez sin haber concedido el permiso de notificaciones, EL SISTEMA explica para qué lo necesita antes de solicitarlo. Origen: HU-004 esc. "Permiso de notificaciones"; decisiones 004 #2.
- RF-6: SI el estudiante deniega el permiso de notificaciones, ENTONCES la app continúa funcionando igual, avisa con la app abierta (RF-3) y ofrece desde ajustes un enlace para revisar el permiso. Origen: decisiones 004 #3.
- RF-7: EL SISTEMA programa el aviso de fin al iniciar una fase en curso y lo cancela o reprograma al pausar, reiniciar u omitir la fase, de modo que nunca avisa de una fase que ya no está en curso. Origen: decisiones 004 #6; HU-003 (aviso con app cerrada).
- RF-8: EL SISTEMA usa el mismo patrón de vibración en la notificación y en la alarma in-app, distinguible de otras notificaciones. Origen: decisiones 004 #7.

## Requisitos no funcionales

- RNF-1: Los avisos funcionan sin conexión a internet (notificaciones locales, sin servidores). Origen: Constitución #2; decisiones 006 #4.
- RNF-2: La implementación es compatible con Expo Go; no exige compilar la app. Origen: decisiones 004 #8.
- RNF-3: El permiso se solicita una sola vez como máximo; después de denegado no se vuelve a insistir automáticamente. Origen: decisiones 004 #2, #3.
- RNF-4: El texto de todos los avisos está en español. Origen: AGENTS.md; skill `cotopaxi-brand`.

## Casos límite

- Permiso concedido pero notificaciones bloqueadas en la configuración del sistema: el enlace de ajustes (RF-6) es la salida; se documenta, no se automatiza.
- El estudiante toca la notificación minutos después de que la fase terminó: la app abre mostrando la siguiente fase preparada (la reconciliación de la spec 003 ya aplicó el cambio).
- La app muere entre el inicio de la fase y su fin: la notificación programada igualmente se entrega (la dispara el sistema, no la app).
- Fin de fase ocurrido mientras la app estaba cerrada y el estudiante la abre antes de tocar la notificación: la app cancela el aviso pendiente y muestra la fase siguiente preparada.
- Volumen del sistema en cero: la notificación no suena; la alarma in-app (RF-3) cubre el caso con la app en primer plano.

## Fuera de alcance

- Forzar sonido en silencio con la app en segundo plano dentro de Expo Go: limitación técnica documentada; queda como mejora futura con development build y módulo nativo (`USAGE_ALARM`). Origen: decisiones 004 #1.
- Notificaciones push, recordatorios de hábito, sonidos personalizados por fase y notificaciones remotas.

## Criterios de finalización

- Pruebas Jest de la lógica pura (texto del aviso, gating de permiso, programación/cancelación) en verde.
- `npx tsc --noEmit` y `npm run lint` sin errores.
- Lista manual en Expo Go ejecutada por el usuario: aviso con app abierta, aviso con app cerrada, silencio con app abierta, denegar permiso, tocar notificación.

## Dudas abiertas

- Ninguna (la limitación de Expo Go quedó registrada en "Fuera de alcance" a partir de la decisión 004 #1 de la entrevista).
