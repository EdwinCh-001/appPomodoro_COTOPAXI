# Decisiones — 005-configuracion (HU-005)

- **Fecha:** 2026-10-19
- **Historia:** HU-005 — Ajustar los tiempos del pomodoro
- **Origen:** Entrevista grill-me (8 preguntas, sin correcciones)

## Decisiones

1. **Rangos permitidos (la HU habla de "rango permitido" sin definirlo):** estudio **1–90** min; descanso corto **1–30** min; descanso largo **1–60** min; pomodoros por ciclo **1–10**.
2. **Unidad: minutos enteros.** No se aceptan segundos. Por qué: simplifica validación, interfaz y el criterio de la HU.
3. **Control de entrada: campo numérico con teclado numérico** y validación al guardar. Es el único control que permite el escenario de la HU ("dejo un campo vacío").
4. **Guardado: botón "Guardar ajustes".** Valida todos los campos en conjunto y persiste solo si todo es válido. Coincide con el criterio "cambio un tiempo y guardo".
5. **Aplicación del cambio: desde la siguiente fase.** Si hay una fase en curso (`running` o `paused`), esa fase termina con el tiempo con el que empezó; el nuevo valor aplica en la siguiente (criterio textual de la HU).
6. **Restablecer: confirmación con `Alert` (misma interacción que reiniciar en HU-001)** que restaura 25/5/15/4 y persiste. Solo afecta a los ajustes; no toca el ciclo en curso ni borra la sesión.
7. **Errores de validación: mensaje en español junto al campo con su rango válido** (p. ej. "Ingresa un número entre 1 y 90 minutos"), sin modales que interrumpan.
8. **Persistencia: clave propia de ajustes en AsyncStorage, separada del snapshot de sesión (HU-003).** Se cargan antes del primer render y sobreviven a un restablecimiento de sesión.

## Riesgos y notas

- Ninguno abierto. La decisión 8 evita que un futuro "borrar sesión" destruya los ajustes del estudiante.

## Enmienda (2026-10-19, decisión del usuario)

- La decisión 1 se corrige: el rango de tiempo de estudio es **1–60 minutos** (no 1–90), alineado con la skill `pomodoro-rules`, que AGENTS.md define como fuente de verdad de las reglas del temporizador. Las demás decisiones de esta spec se mantienen.

## Enmienda (2026-10-20, decisión del usuario)

El usuario, al probar en Expo Go, pide que guardar ajustes se refleje **de inmediato** en la pantalla principal y que la app espere a que pulse Iniciar. Esto **cambia las decisiones 5 y 6**:

1. **Aplicación del cambio: inmediata y reinicia el ciclo de cero (revierte la decisión 5).** Al pulsar "Guardar ajustes" con valores válidos, el ciclo vuelve a empezar: contador de pomodoros en 0, fase de estudio preparada con la duración nueva y esperando que el usuario pulse Iniciar. Ya no se conserva "la duración con la que empezó la fase" ni el contador del ciclo.
2. **Restablecer se comporta igual que guardar.** Al confirmar, el ciclo también vuelve a empezar de cero con 25/5/15/4 y espera Iniciar.
3. Las fases **siguientes** del ciclo siguen avanzando solas (estudio → descanso corto → estudio → descanso largo), sin pedir confirmación; solo la primera fase del ciclo nuevo requiere que el usuario pulse Iniciar.

Requiere actualizar `spec.md` (RF-1, RF-4, RF-5, RF-8), `plan.md` y `tasks.md`.

## Corrección (2026-10-20, decisión del usuario)

El usuario pide **retomar** el criterio original de la decisión 5: la enmienda anterior fue un error suyo. Vuelve a regir "la fase actual termina con el tiempo con el que empezó y el cambio se aplica a la siguiente", con estas precisiones confirmadas:

1. **La fase en curso nunca cambia (revierte la enmienda del 2026-10-20).** Si está `running` o `paused`, conserva su `durationSeconds`, su `endAt` y su `remainingSeconds`: los ajustes nuevos **no** tocan el reloj ya visible.
2. **El contador y el progreso se mantienen.** Ya no se reinicia el ciclo a cero: se conserva `completedPomodoros`, la fase activa y el estado de la sesión.
3. **Solo cambia 'pomodoros por ciclo': se mantiene todo y cambia solo el objetivo.** El nuevo `targetPomodoros` rige la transición desde ese momento (decide cuándo toca el descanso largo).
4. **Excepción: una fase `ready` (preparada, sin iniciar) sí adopta la duración nueva.** No tiene un tiempo "con el que empezó"; su reloj visible pasa al valor nuevo para que el estudiante vea lo que va a arrancar.
5. Las fases **siguientes** siguen avanzando solas (sin cambios): `advancePhase` lee `durations[next]`, que ya es la configuración nueva.

Reimplementado en `applySessionSettings` (`src/domain/session.ts`) y cubierto por `src/domain/__tests__/settingsApply.test.ts` y `settingsFlow.test.ts`. Requiere actualizar `spec.md` (RF-1, RF-4, RF-5, RF-8), `plan.md` y `tasks.md`.

