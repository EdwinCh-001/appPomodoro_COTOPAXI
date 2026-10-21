# Spec 005 — Configuración de tiempos

Estado: implementada
HU de origen: docs/historias/HU-005.md

## Contexto y objetivo

Cada estudiante tiene su ritmo: alguien necesita bloques de estudio más largos, otros descansos más cortos. Esta spec permite ajustar la duración del estudio, de los descansos y la cantidad de pomodoros antes del descanso largo, con validación y valores por defecto seguros.

## Usuarios

- Estudiante que adapta la técnica a su ritmo y quiere que sus ajustes sobrevivan a cerrar la app.

## Historias de usuario

- HU-005 — Ajustar los tiempos del pomodoro (4 escenarios: cambiar un tiempo, ingresar un valor no válido, volver a los valores por defecto, cambiar un tiempo con una fase en curso).

## Definiciones

- **Ajustes:** duración del estudio, del descanso corto y del descanso largo, y cantidad de pomodoros por ciclo.
- **Valor por defecto:** 25 minutos de estudio, 5 de descanso corto, 15 de descanso largo y 4 pomodoros por ciclo.

## Requisitos funcionales

- RF-1: CUANDO el estudiante cambia un tiempo o la cantidad de pomodoros y pulsa Guardar con valores válidos, EL SISTEMA guarda los cambios y los usa de inmediato en la pantalla principal: los ajustes nuevos rigen a partir de la fase siguiente, y la fase en curso no se altera. *Corregido 2026-10-20: vuelve al criterio original "desde la próxima fase" (la enmienda intermedia que reiniciaba el ciclo fue un error del usuario); ver `decisiones.md`.* Origen: HU-005 esc. "Cambiar un tiempo"; decisiones 005 #4, #5.
- RF-2: CUANDO el estudiante guarda, EL SISTEMA admite solo minutos enteros dentro de los rangos: estudio **1–60**, descanso corto 1–30, descanso largo 1–60 y pomodoros 1–10. Origen: decisiones 005 #1, #2 (estudio corregido a 1–60 por enmienda del usuario del 2026-10-19; ver `decisiones.md`).
- RF-3: SI un valor está vacío, es cero, negativo, no numérico o fuera de rango, ENTONCES el sistema no guarda ningún cambio y muestra junto al campo un mensaje en español con el rango permitido. Origen: HU-005 esc. "Ingresar un valor no válido"; decisiones 005 #3, #7.
- RF-4: CUANDO el estudiante elige Restablecer y lo confirma, EL SISTEMA vuelve a 25/5/15/4 y lo guarda, sin reiniciar el ciclo: la fase en curso se mantiene y los valores nuevos rigen a partir de la fase siguiente. *Corregido 2026-10-20; ver `decisiones.md`.* Origen: HU-005 esc. "Volver a los valores por defecto"; decisiones 005 #6.
- RF-5: CUANDO el estudiante guarda ajustes válidos mientras hay una fase en curso o pausada, EL SISTEMA conserva esa fase con el tiempo con el que empezó (su reloj no cambia) y su contador; los ajustes nuevos se aplican en la fase siguiente. Si la fase está preparada sin iniciar, su reloj visible adopta la duración nueva. *Corregido 2026-10-20: vuelve al criterio original de la decisión 5; ver `decisiones.md`.* Origen: HU-005 esc. "Cambiar un tiempo con una fase en curso"; decisiones 005 #5.
- RF-6: EL SISTEMA guarda los ajustes de forma que sobreviven al cierre y al reinicio de la app, y no se pierden al restablecer la sesión. Origen: HU-005 esc. "Cambiar un tiempo"; decisiones 005 #8.
- RF-7: SI el estudiante nunca ha guardado ajustes, ENTONCES la app usa los valores por defecto. Origen: HU-005 esc. "Volver a los valores por defecto"; decisiones 005 #1.
- RF-8: Restablecer y Guardar no reinician el ciclo: la sesión (fase, reloj y contador) se mantiene; los ajustes nuevos rigen a partir de la fase siguiente. Origen: decisiones 005 #6 (corregida el 2026-10-20).

## Requisitos no funcionales

- RNF-1: La validación vive en funciones puras probadas con Jest. Origen: Constitución #5 y #6.
- RNF-2: La pantalla de ajustes respeta las convenciones de interfaz: campos con teclado numérico, sin controles tapados por el teclado, textos en español e identidad Cotopaxi. Origen: skills `rn-conventions` y `cotopaxi-brand`.
- RNF-3: La pantalla de ajustes tiene ruta propia dentro de la app, aprobada en decisiones 001 #7. Origen: decisiones 001 #7.

## Casos límite

- Valores exactamente en los límites (1 o el máximo permitido): válidos.
- Guardar sin haber cambiado nada: no produce error ni escritura innecesaria.
- Ajustes guardados y luego borrados manualmente de la app: la app vuelve a los valores por defecto (RF-7).
- Cambiar la cantidad de pomodoros con un ciclo en curso: se mantiene todo (fase, reloj y contador) y solo cambia el objetivo con el que se decide el descanso largo.
- Guardar o restablecer con una fase en curso: la fase sigue con el tiempo con el que empezó y su contador; los valores nuevos rigen desde la fase siguiente.
- Cambiar ajustes con la app en segundo plano: al volver, la sesión sigue como estaba y la fase siguiente ya usa los valores guardados (RF-5 corregido).

## Fuera de alcance

- Temas, idiomas, fuentes de sonido personalizadas.
- Historial o estadísticas de uso.
- Exportar/importar ajustes.

## Criterios de finalización

- Pruebas Jest de la validación (incluidos límites y valores inválidos) en verde.
- `npx tsc --noEmit` y `npm run lint` sin errores.
- Lista manual en Expo Go ejecutada por el usuario: cambiar y persistir tras cerrar, valor inválido, restablecer y cambio con fase en curso.

## Dudas abiertas

- Ninguna. El rango de tiempo de estudio quedó en 1–60 minutos por decisión del usuario del 2026-10-19, alineada con la skill `pomodoro-rules` (ver enmienda en `decisiones.md`).
