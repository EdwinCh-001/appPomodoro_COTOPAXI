# Decisiones — 001-temporizador (HU-001)

- **Fecha:** 2026-10-19
- **Historia:** HU-001 — Iniciar y controlar una sesión de estudio
- **Origen:** Entrevista grill-me (8 preguntas, sin correcciones)

## Decisiones

1. **Fuente de verdad del temporizador: timestamp absoluto (epoch) de fin de fase.**
   El restante se deriva siempre de `(fin - ahora)`. Por qué: es la base que permite cumplir HU-003 (bloqueos, reinicios, cierre de la app) sin desfases.
2. **Estado en la interfaz: hook `useTimer` que consume las funciones puras de `src/domain/`.**
   Por qué: cumple la Constitución #5 (lógica desacoplada de React y AsyncStorage) y mantiene un único poseedor del estado del timer.
3. **Cálculo del tick: intervalo ligero que recalcula por diferencia de fechas.**
   Por qué: evita el *drift* del `setInterval` decremental cuando el event loop se retrasa.
4. **Confirmación de reinicio: `Alert` nativo de React Native con "Reiniciar" y "Cancelar".**
   Cancelar conserva el tiempo que llevaba la fase (criterio de aceptación "Cambiar de opinión al reiniciar").
5. **Controles de la pantalla principal: "Iniciar/Pausar" + "Reiniciar" siempre visibles; el botón "Omitir" se muestra únicamente cuando la fase activa es un descanso (decisión tomada junto con HU-002).**
6. **Formato del tiempo: `mm:ss`.**
   Por qué: el rango máximo de ajustes (HU-005, 90 min) no requiere horas.
7. **Estructura de rutas (aprobación explícita requerida por AGENTS.md): `index` = temporizador y `settings` = ajustes, ambas bajo `src/app/`.**
   Por qué: HU-005 necesita una pantalla de ajustes y HU-006 exige llegar al temporizador como pantalla principal.
8. **Alcance del reinicio: solo el tiempo de la fase actual; el contador de pomodoros del ciclo (HU-002) no se toca.**
   Por qué: criterio textual de la HU-001 ("vuelve al tiempo inicial de la fase en la que estoy").

## Riesgos y notas

- La decisión 7 crea carpetas de ruta nuevas; queda aprobada aquí, pero su implementación debe esperar a la fase correspondiente del plan.
