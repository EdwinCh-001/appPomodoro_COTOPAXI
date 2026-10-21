# Plan — Spec 002 Ciclos Pomodoro

Plan técnico para `specs/002-ciclos-pomodoro/spec.md`. Decisiones de negocio: `specs/002-ciclos-pomodoro/decisiones.md`. Depende de la spec 001 (`src/domain/timer.ts`).

## Archivos y responsabilidades

| Archivo | Responsabilidad | RF |
|---|---|---|
| `src/domain/cycle.ts` | Funciones puras del ciclo: fase siguiente, conteo de pomodoros, omisión de descansos. | RF-1..RF-3, RF-5..RF-7, RF-9 |
| `src/domain/cycle.test.ts` (en `src/domain/__tests__/`) | Pruebas Jest del ciclo completo. | RNF-1 |
| `src/hooks/useTimer.ts` (ampliación) | Al detectar el fin de una fase, aplica `nextPhase` y deja la siguiente preparada (no iniciada). | RF-4, RF-9 |
| `src/components/CycleIndicator.tsx` | Fila de puntos (relleno = pomodoro completado) + texto "Pomodoro N de M" y nombre de fase. | RF-8, RNF-2 |
| `src/components/TimerControls.tsx` (ampliación) | Botón "Omitir" visible solo cuando la fase activa es descanso. | RF-6, RF-7 |
| `src/app/index.tsx` (ampliación) | Integración: indicador de avance, etiqueta de fase con tema visual de estudio/descanso. | RF-8 |

## Funciones puras (src/domain/cycle.ts)

Tipos: `PhaseKind = 'study' | 'shortBreak' | 'longBreak'`; la fase terminada de la spec 001 se representa con `PhaseStatus 'done'`.

- `nextPhase(completedPomodoros, targetPomodoros, previousKind)` → `PhaseKind`:
  - si `previousKind === 'study'`: `completedPomodoros >= targetPomodoros ? 'longBreak' : 'shortBreak'`
  - si `previousKind` es un descanso: `'study'`
- `countPomodoro(completed, target)` → `completed + 1` (solo llamado al terminar un estudio).
- `resetCycle()` → `0` (el contador vuelve a cero al quedar listo el descanso largo).
- `canOmit(phaseKind)` → `phaseKind !== 'study'`.

## Algoritmo en pseudocódigo (fin de fase)

```
cuando el timer marca fin de fase (status = done):
  si fase terminada es estudio:
      pomodoros = countPomodoro(pomodoros, target)
      si pomodoros >= target:
          siguiente = longBreak
          pomodoros = resetCycle()
      sino:
          siguiente = shortBreak
  sino (era descanso):
      siguiente = 'study'
  faseSiguiente = preparada(siguiente, duración de la spec 005)
  UI la muestra lista con su botón Iniciar   // RF-4: nunca auto-arranca

omitir (solo si canOmit(faseActual)):
  faseActual termina sin contar (no es pomodoro)
  preparar la siguiente fase según la regla de arriba
```

El contador se incrementa **solo** al terminar el estudio completo (RF-5); omitir un descanso no lo toca.

## Interfaz

- `CycleIndicator` sobre el temporizador: puntos `#357CA5` (completados, rellenos) y `#B5BBC8` (pendientes), con texto "Pomodoro 2 de 4" (nunca solo color, RNF-2).
- La pantalla principal cambia de tema según la fase: estudio usa el botón primario `#357CA5`; descanso usa el estado de pausa/descanso `#5AC594` (skill `cotopaxi-brand`).
- "Omitir" es un botón secundario de texto, con `accessibilityLabel`, montado condicionalmente (RF-7).

## Decisiones justificadas

- **`nextPhase` como función única** vs `if/else` repartidos en el hook: la regla de negocio queda probable y desacoplada (decisiones 002 #1; Constitución #5).
- **Descanso automático (enmienda del 2026-10-20)** vs manual: el usuario pidió en Expo Go que la siguiente fase arranque sola; sustituye la decisión 002 #2 original. Queda documentado en `decisiones.md`.
- **Incremento al terminar el estudio y reset al preparar el descanso largo** vs reset al terminar el descanso largo: coincide textualmente con "el contador vuelve a cero" al llegar al descanso largo (decisiones 002 #3).
- **Omitir solo en descansos** vs Omitir universal: en HU-001 los controles quedaron definidos sin Omitir para el estudio; limitarlo evita contradicción (decisiones 002 #4).

## Estrategia de pruebas con Jest

`src/domain/__tests__/cycle.test.ts` (todas puras, sin timers reales):

1. Estudio terminado con pomodoros 0, 1, 2 (< objetivo 4) → descanso corto y contador incrementado.
2. Estudio terminado con pomodoros 3 (4º) → descanso largo y contador a 0.
3. Descanso corto o largo terminado → estudio.
4. Ciclo con objetivo 1 → siempre descanso largo y contador a 0.
5. `canOmit`: false en estudio, true en descanso.
6. Omisión de descanso no altera el contador.
7. Reiniciar fase (HU-001) no altera el contador (integración de tipos).

Checklist de `pomodoro-rules` cubierto por los puntos 1–3 y 6.
