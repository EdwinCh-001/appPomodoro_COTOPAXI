# Tareas — Spec 002 Ciclos Pomodoro

Depende de la spec 001 implementada. Una tarea cada vez: pruebas en rojo → código → `npx jest` en verde → parar. Las tareas de interfaz esperan confirmación del usuario en Expo Go.

- [x] **T1. Funciones puras del ciclo con pruebas.** Crear `src/domain/cycle.ts` (`nextPhase`, `countPomodoro`, `resetCycle`, `canOmit`) con pruebas en rojo: pomodoros 1/2/3 → corto, 4º → largo + contador a 0, objetivo 1, omisión no altera contador. RF-1, RF-2, RF-3, RF-5, RF-9 — *Hecho 2026-10-20: `src/domain/cycle.ts` + `src/domain/__tests__/cycle.test.ts`; `npx jest --preset jest-expo src/domain` → 24/24 en verde (14 de la spec 001 + 10 del ciclo) y `tsc` exit 0. `nextPhase` recibe el contador **ya actualizado** con el estudio recién terminado (documentado en el módulo).*
  - Hecho cuando: `npx jest` en verde con los 7 grupos de pruebas del plan.
- [x] **T2. Fin de fase deja la siguiente preparada.** Ampliar `useTimer` para aplicar `nextPhase` al llegar a cero y dejar la siguiente fase en estado preparado (nombre, duración, botón Iniciar); nunca auto-iniciar. RF-4, RF-9 — *Hecho 2026-10-20: nuevo `src/domain/session.ts` (puro) con `createSession`, `advancePhase`, `skipPhase`, `shouldAdvance`, `sessionRemaining`; `useTimer` reescrito sobre el estado de sesión (contador de pomodoros fuera del timer, así `resetPhase` no puede tocarlo). `npx jest --preset jest-expo` → 42/42 en verde, `tsc` exit 0.*
  - Hecho cuando: en Expo Go, al terminar un estudio la pantalla muestra "Descanso corto listo" con su duración y no empieza a contar hasta que el usuario pulsa Iniciar.
- [x] **T3. Indicador de avance.** Crear `CycleIndicator` (puntos + texto "Pomodoro N de M" + nombre de fase) e integrarlo en la pantalla principal, con tema visual de estudio/descanso según `cotopaxi-brand`. RF-8, RNF-2 — *Hecho 2026-10-20: `src/components/CycleIndicator.tsx` y `src/domain/labels.ts` (`PHASE_LABELS`, `isBreak`); `TimerDisplay` acepta `variant` study/break; `index.tsx` integra el indicador. El texto "Pomodoro N de M" evita depender solo del color.*
  - Hecho cuando: en Expo Go se ve el avance correcto al completar pomodoros y el texto se lee sin depender del color.
- [x] **T4. Acción "Omitir" solo en descansos.** Ampliar `TimerControls` con el botón condicional y conectarlo a la omisión del dominio. RF-6, RF-7 — *Hecho 2026-10-20: `TimerControls` recibe `onSkip` y `canSkip`; el botón "Omitir descanso" se monta solo si `canOmit(phaseKind)`; conectado a `skip` → `skipPhase` (no toca el contador).*
  - Hecho cuando: en Expo Go el botón no aparece durante el estudio, aparece en descansos y al usarlo se prepara la siguiente fase de estudio sin tocar el contador.
- [x] **T5. Verificación de cierre.** `npx jest`, `npx tsc --noEmit`, `npm run lint` en verde; checklist de `pomodoro-rules` (transiciones) y lista manual de `rn-conventions` ejecutados por el usuario. RF-1..RF-9 — *Hecho 2026-10-20: `tsc` exit 0, `jest --preset jest-expo` 42/42, `expo lint` 0 errores y 0 warnings. Lista manual de `rn-conventions` y checklist de `pomodoro-rules` (transiciones) confirmados por el usuario en Expo Go. **Spec 002 marcada como `implementada`.***
  - Hecho cuando: los tres comandos pasan y el usuario confirma la lista manual; la spec pasa a `implementada` solo con su aprobación.

## Enmienda 2026-10-20 (reabierta por decisiones del usuario)

El usuario, tras probar en Expo Go, pidió dos cambios que revierten/ concretan decisiones aprobadas (ver `decisiones.md`, sección Enmienda):

- [x] **T6. Auto-inicio de la siguiente fase.** `advancePhase(session, now)` inicia la fase siguiente con su duración vigente; `reconcile` y el tick de `useTimer` propagan `now`. Revierte la decisión 002 #2 y actualiza RF-4. — *Hecho 2026-10-20: `src/domain/session.ts` usa `startPhase` en la transición; `reconcile` y `useTimer` pasan `now`; pruebas de `session`, `reconcile`, `cycleFlow`, `persistenceFlow` y `settingsFlow` actualizadas a `running`. `skipPhase` sigue dejando el estudio preparado (acción manual).*
  - Hecho cuando: al terminar una fase, la siguiente arranca sola con su tiempo completo.
- [x] **T7. "Reiniciar" solo en estudio.** `TimerControls` recibe `canReset`; el botón se monta solo si la fase es de estudio y ya está iniciada. Durante el descanso quedan Pausar/Reanudar y Omitir. — *Hecho 2026-10-20: `canReset={!breakTime}` en `index.tsx`; `showReset = canReset && status !== 'ready'`.*
  - Hecho cuando: en un descanso no aparece "Reiniciar"; en estudio aparece tras iniciar.

## Enmienda 2026-10-20 — fin de sesión (decisión del usuario)

El usuario pidió que, al completar todos los ciclos de una sesión, la app termine con un botón "Terminar sesión" que devuelva a la fase 1 esperando Iniciar. Ver `decisiones.md` (enmienda fin de sesión) y `spec.md` (RF-10..RF-13).

- [x] **T8. Estado "sesión terminada" en el dominio con pruebas.** En `src/domain/session.ts`: `advancePhase` deja la sesión terminada al acabar el descanso largo (sin arrancar estudio, manteniendo la fase vencida en `00:00`); nueva función pura `endSession` que prepara un ciclo nuevo desde cero con los parámetros vigentes esperando Iniciar; `SessionState` gana el indicador `sessionEnded` (`createSession` y `applySessionSettings` lo dejan en `false`). Pruebas en `session.test.ts` / `cycleFlow.test.ts`. RF-10, RF-11, RNF-1
  - Hecho cuando: `npx jest` en verde cubriendo: descanso largo terminado → sesión terminada en `00:00`; `endSession` → fase 1 preparada con contador 0 y las duraciones/objetivo definidos; cambio de ajustes limpia el indicador.
  - *Hecho 2026-10-20: `npx jest --preset jest-expo` 117/117, `tsc` exit 0. Precisión aplicada tras tu prueba en Expo Go: la pantalla no se reinicia al terminar el descanso largo; el reloj se queda en `00:00`.*
- [x] **T9. Persistir el estado terminado.** Añadir `sessionEnded` a `SessionSnapshot`, `toSnapshot` y `reconcile` (incluida la transición pendiente: si al reabrir vence el descanso largo, la sesión queda terminada). Pruebas en `reconcile.test.ts` / `persistenceFlow.test.ts`. RF-13
  - Hecho cuando: guardar→cargar conserva el indicador y, tras un descanso largo vencido con la app cerrada, se reabre en estado terminado.
  - *Hecho 2026-10-20: el snapshot antiguo sin el campo sigue siendo válido (compatible).*
- [x] **T10. Botón "Terminar sesión" en la interfaz.** `useTimer` expone `sessionEnded` y `endSession`; `TimerControls` muestra **solo** "Terminar sesión" en ese estado (oculta Iniciar/Pausar/Reanudar/Reiniciar/Omitir) y lo conecta. RF-12
  - Hecho cuando: en Expo Go, al acabar el descanso largo solo aparece "Terminar sesión" y al pulsarlo vuelve a "Pomodoro 0 de N" esperando Iniciar; al reabrir la app en ese estado se sigue viendo el botón.
  - *Pendiente tu confirmación en Expo Go (precisión aplicada 2026-10-20).*
