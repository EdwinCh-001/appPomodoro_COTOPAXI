# Decisiones — 006-funcionamiento-offline (HU-006)

- **Fecha:** 2026-10-19
- **Historia:** HU-006 — Usar la aplicación sin registro, sin internet y sin publicidad
- **Origen:** Entrevista grill-me (8 preguntas, sin correcciones)

## Decisiones

1. **Onboarding: pantalla de bienvenida de una sola página** con la identidad Cotopaxi y un botón "Empezar"; no pide ningún dato.
   *Matiz registrado:* el criterio de la HU dice "llego directo al temporizador"; la HU prohíbe pantallas de **registro/inicio de sesión**, que esta bienvenida no es. Debe quedar en la spec como pantalla sin datos, descartable en un toque, sin persistir estado de "ya vista" (reabrirla tras borrar datos la muestra de nuevo, y eso es aceptable).
2. **Dependencias: lista blanca estricta.** Permitidas: `expo`, React Native, `@react-native-async-storage/async-storage`, `expo-notifications`, haptics y las que apruebe una tarea explícita. Prohibidas: SDKs de publicidad, analítica, autenticación, *crash reporting* y cualquier cliente HTTP activo.
3. **Assets (fuentes, iconos, ilustraciones): todo embebido en el bundle;** cero requests a CDNs o servidores en runtime.
4. **Alcance offline: toda la función esencial** (temporizador, ciclos, avisos con notificaciones locales, ajustes) opera sin datos móviles ni wifi. *Riesgo aceptado:* el SO puede aplazar notificaciones con políticas de batería agresivas; no se considera incumplimiento de la HU.
5. **Datos guardados en el dispositivo (lista exhaustiva): ajustes + snapshot de sesión + estado del permiso de notificaciones.** Sin historial, sin identificadores del dispositivo, sin nada más.
6. **Permisos solicitados: únicamente notificaciones** (HU-004). Sin contacto, ubicación, almacenamiento externo ni cámara.
7. **Verificación de dependencias: checklist manual en `tasks.md`** que obliga a revisar `package.json` antes de toda tarea que agregue una dependencia (regla de AGENTS.md: preguntar antes de instalar).
8. **Datos sensibles: ninguno.** Se confirma que la app no guarda credenciales, ubicación, contactos ni datos personales; AsyncStorage es de solo uso local de la app y no se comparte con ningún tercero. No se cifra (sobredimensionado para este alcance).

## Riesgos y notas

- La decisión 1 es la única que matiza un criterio de la HU; si el usuario final considera que la bienenda estorba, debe eliminarse sin tocar el resto del diseño.

## Enmienda (2026-10-19, decisión del usuario)

- El usuario aprobó explícitamente agregar a la lista blanca, además de las ya presentes: **`expo-notifications`** (~57.0.23) y **`expo-audio`** (~57.0.5), requeridas por la spec 004. Instaladas con `npx expo install` (compatible con SDK 57).

## Enmienda (2026-10-20, decisión del usuario) — revertida

- Revierte la enmienda que había introducido la `specs/007-historial-sesiones/` (eliminada el 2026-10-20 por decisión del usuario). La decisión 5 se mantiene **como estaba**: la lista de datos guardados es ajustes + snapshot de sesión + estado del permiso de notificaciones. Sin historial de ciclos.
