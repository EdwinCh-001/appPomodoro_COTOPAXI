# Decisiones — 003-persistencia-sesion (HU-003)

- **Fecha:** 2026-10-19
- **Historia:** HU-003 — Mantener el conteo con el celular bloqueado o la app cerrada
- **Origen:** Entrevista grill-me (8 preguntas, sin correcciones)
- **Riesgo de la HU:** Alto

## Decisiones

1. **Qué se persiste: snapshot completo de sesión** — fase actual, estado (`idle/running/paused/completed`), timestamp epoch de fin de fase, pomodoros del ciclo y `schemaVersion`. Los ajustes viven en una clave propia (decisión 8 de HU-005).
2. **Frecuencia de guardado: en cada transición de estado (iniciar, pausar, reanudar, cambio de fase, ajustes) y en cada tick de 1 s.** Pérdida máxima aceptada si el SO mata la app: 1 s.
3. **Reconciliación al arrancar: comparar `ahora` contra el timestamp de fin.** Si ya venció, se aplica la transición pendiente (fase completada + aviso de HU-004) antes de pintar la UI. No se encadenan varias fases vencidas.
4. **Aviso con la app cerrada: notificación local programada** con trigger en el timestamp de fin de fase (ver `specs/004-notificaciones/decisiones.md`).
5. **Estado pausado: se persiste `paused` con el restante exacto en el momento de pausar.** Al reabrir se muestra idéntico y no se dispara ningún aviso (criterio de la HU).
6. **Datos corruptos o esquema desconocido: fallback a los valores por defecto de HU-005** (sesión en `idle` con 25/5/15/4). Nunca debe crashear por datos ilegibles.
7. **`schemaVersion` incluido en el objeto persistido.** Versión desconocida → descartar y usar defaults (sin sistema de migraciones por ahora; se añadirá cuando exista un formato anterior real).
8. **El tiempo restante se deriva siempre del timestamp** (`fin - ahora`), nunca se "suma tiempo transcurrido" a un contador. Garantiza exactitud tras bloqueos largos.

## Riesgos y notas

- Guardar en cada tick implica una escritura por segundo en AsyncStorage: aceptable para este alcance, pero debe medirse en dispositivo antes de considerar terminada la tarea.

## Enmienda (2026-10-20, decisión del usuario) — revertida

- Revierte la enmienda que había introducido la `specs/007-historial-sesiones/` (eliminada el 2026-10-20 por decisión del usuario). La decisión 3 se mantiene **como estaba**: al reabrir tras un cierre, la app recupera la sesión en curso en la pantalla principal; no hay arranque limpio ni historial. Sin historial de ciclos (ver también `specs/006`, decisión 5).

## Nota (2026-10-20, enmienda fin de sesión de la spec 002)

- El snapshot guardado incorpora además el indicador **"sesión terminada"** (fin de ciclo). Hoy vive en `session@v1` junto al resto del estado; reutiliza la misma validación de forma y la versión de esquema. No cambia la clave ni añade datos personales.
