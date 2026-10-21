# Plan — Spec 001 Temporizador

Plan técnico para `specs/001-temporizador/spec.md`. Las decisiones de negocio están en `specs/001-temporizador/decisiones.md`.

## Archivos y responsabilidades

| Archivo | Responsabilidad | RF |
|---|---|---|
| `src/domain/timer.ts` | Funciones puras del temporizador: crear fase, calcular restante, pausar, reanudar, reiniciar, detectar fin. Sin React ni AsyncStorage. | RF-1..RF-7, RF-9, RNF-1, RNF-2 |
| `src/domain/format.ts` | `formatTime(seconds): string` → `mm:ss`. Pura. | RF-2 |
| `src/domain/__tests__/timer.test.ts`, `format.test.ts` | Pruebas Jest de las funciones puras. | RNF-2 |
| `src/hooks/useTimer.ts` | Hook que posee el estado del timer en la interfaz, ejecuta el tick (recalcula por diferencia de fechas) y expone iniciar/pausar/reanudar/reiniciar. Hoy solo memoria; la spec 003 añadirá persistencia aquí. | RF-1..RF-4, RF-9 |
| `src/app/index.tsx` | Pantalla principal: display del tiempo, fase actual, botones de control (reemplaza el contenido de plantilla actual). | RF-8, RNF-3, RNF-4 |
| `src/components/TimerDisplay.tsx` | Vista del tiempo mm:ss y etiqueta de fase. | RF-2, RF-9 |
| `src/components/TimerControls.tsx` | Botones Iniciar/Pausar/Reiniciar con confirmación `Alert` para reiniciar. | RF-5..RF-8 |

No se crea ninguna carpeta de ruta nueva: la spec 005 se encarga de `src/app/settings/` (aprobado en decisiones 001 #7).

## Funciones puras (src/domain/timer.ts)

Tipos: `PhaseStatus = 'ready' | 'running' | 'paused' | 'done'` (la spec 002 amplía con los ciclos).

- `startPhase(durationSeconds, now)` → `{ status: 'running', endAt: now + durationSeconds*1000, remainingSeconds: durationSeconds }`
- `computeRemaining(endAt, now)` → segundos restantes, nunca menor que 0.
- `pause(state, now)` → `{ status: 'paused', remainingSeconds: computeRemaining(...), endAt: null }` (congelar restante exacto).
- `resume(state, now)` → `endAt = now + remainingSeconds*1000`, status `running`.
- `resetPhase(state, durationSeconds, now)` → restablece `endAt` y `remainingSeconds`; **no recibe ni toca el contador de pomodoros** (RF-6).
- `isDone(state, now)` → `now >= endAt` con status `running`.

## Algoritmo en pseudocódigo (tick)

```
cada tick (intervalo ligero, ~250-1000 ms):
  si status != running: no hacer nada (mostrar remainingSeconds congelado)
  restante = computeRemaining(endAt, now)
  si restante <= 0:
      estado = done; restante = 0   // la spec 002 decidirá la siguiente fase
  render(formatTime(restante))
```

El restante **nunca** se decrementa por conteo de intervalos; siempre se deriva del timestamp (RNF-1). Nota: `pomodoro-rules` pide medir en segundos internamente — se cumple, porque `computeRemaining` devuelve segundos derivados del timestamp.

## Interfaz

- `index.tsx`: fondo `#E2E4E9`, tarjeta blanca `#FFFFFF`, encabezado `#001F3F` con texto blanco, botón primario `#357CA5`, acción destructiva (reiniciar) `#D33724` (skill `cotopaxi-brand`).
- Botón principal alterna Iniciar/Pausar (con `accessibilityLabel` en español). Reiniciar siempre visible; usa `Alert.alert` con "Reiniciar" y "Cancelar" (rf-5).
- `TimerDisplay` muestra `mm:ss` en tamaño grande y la etiqueta de fase. El estado no depende solo del color (rn-conventions).
- Safe area respetada (`react-native-safe-area-context` ya instalada).

## Decisiones justificadas

- **Tick por diferencia de fechas** vs `setInterval` decremental: el decremento acumula desfase cuando el event loop se retrasa; derivar del timestamp no (decisiones 001 #1, #3; RNF-1).
- **Confirmación con `Alert` nativo** vs modal propio: cumple el criterio de la HU y la convención de diálogos del sistema con la menor cantidad de código (decisiones 001 #4).
- **Hook `useTimer`** vs contexto global: no hay más consumidores que la pantalla principal hoy; el contexto puede aparecer después sin romper nada (decisiones 001 #2).
- **`resetPhase` no recibe el contador de pomodoros** vs reinicio total: el tipo lo impide estructuralmente, no solo por convención (decisiones 001 #8, RF-6).

## Estrategia de pruebas con Jest

`src/domain/__tests__/timer.test.ts` (reloj simulado con `Date.now`/`jest.setSystemTime`):

1. `startPhase` crea fin = ahora + duración.
2. `computeRemaining` devuelve exacto y nunca negativo (pasado el fin).
3. `pause` congela el restante exacto; `resume` reprograma el fin correctamente (pausa → 10 min → reanudar → sigue contando).
4. `resetPhase` vuelve al tiempo inicial de la fase e ignora pomodoros.
5. `isDone` detecta el cruce a cero.
6. `formatTime`: 1500 s → `25:00`, 59 s → `00:59`, 0 → `00:00`, 3600 s → `60:00`.

Cobertura de RF por pruebas: RF-1..RF-7 y RF-9 vía funciones puras; RF-8 se verifica con la lista manual en Expo Go.
