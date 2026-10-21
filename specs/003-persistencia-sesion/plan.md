# Plan — Spec 003 Persistencia de la sesión

Plan técnico para `specs/003-persistencia-sesion/spec.md`. Decisiones: `specs/003-persistencia-sesion/decisiones.md`. Depende de las specs 001 y 002.

## Archivos y responsabilidades

| Archivo | Responsabilidad | RF |
|---|---|---|
| `src/storage/sessionSnapshot.ts` | Guardar/cargar el snapshot con `schemaVersion`; validación y fallback a defaults si falla la lectura o el formato. Usa `@react-native-async-storage/async-storage` (ya instalada). | RF-1, RF-6, RF-7, RF-8 |
| `src/domain/reconcile.ts` | Función pura: dado un snapshot y el instante actual, devuelve el estado reconciliado (fase terminada + siguiente preparada, o pausado intacto, o defaults). | RF-2..RF-5 |
| `src/domain/__tests__/reconcile.test.ts`, `src/storage/__tests__/sessionSnapshot.test.ts` | Pruebas Jest (reloj simulado; AsyncStorage mockeado). | RNF-1 |
| `src/hooks/useTimer.ts` (ampliación) | Al arrancar: cargar snapshot → reconciliar → render. Durante el uso: persistir en cada transición y en el tick. | RF-2..RF-4, RF-7 |
| `src/app/index.tsx` | Sin cambios de diseño; solo consume el hook ya restaurado. | RF-3 |

## Formato persistido

Clave única `session@v1` (valor JSON):

```
{
  schemaVersion: 1,
  phaseKind: 'study' | 'shortBreak' | 'longBreak',
  status: 'ready' | 'running' | 'paused' | 'done',
  endAt: number | null,        // epoch ms; null si está pausada o lista
  remainingSeconds: number,    // exacto al pausar; coherente si está lista
  completedPomodoros: number,
  targetPomodoros: number
}
```

Los ajustes NO viven aquí: tienen clave propia (decisión 005 #8).

## Funciones puras (src/domain/reconcile.ts)

- `reconcile(snapshot | null, now)` → `{ snapshot, pendingNotice }`:
  - `null` o ilegible → snapshot por defecto (fase estudio lista, 25/5/15/4) y `pendingNotice: null`.
  - `status === 'running'` y `now < endAt` → restante = `endAt - now` (RNF-1).
  - `status === 'running'` y `now >= endAt` → fase `done`, siguiente preparada (reglas de `cycle.ts` de la spec 002), `pendingNotice` = fase que terminó (para la spec 004).
  - `status === 'paused'` → se conserva `remainingSeconds` exacto y `pendingNotice: null` (RF-5).
  - `schemaVersion` desconocido → mismo caso que `null` (RF-6, RF-8).

## Algoritmo en pseudocódigo (arranque)

```
al iniciar la app:
  bruto = AsyncStorage.getItem('session@v1')
  snapshot = parseSeguro(bruto)      // try/catch → null
  { snapshot: estado, pendingNotice } = reconcile(snapshot, Date.now())
  render(estado)
  si pendingNotice: entregar aviso (spec 004; hoy, aviso visual)
  persistir(estado)                  // dejar el estado reconciliado en disco

durante el uso:
  en cada transición (iniciar/pausar/reanudar/cambio de fase): persistir(estado)
  en cada tick: persistir(estado)    // pérdida máxima 1 s si el SO mata la app
```

## Decisiones justificadas

- **Snapshot con `schemaVersion`** vs JSON sin versión: permite evolucionar el formato sin romper instalaciones existentes; versión desconocida degrada a defaults (decisiones 003 #7).
- **Reconciliación única al arrancar** vs encadenar todas las fases vencidas: el estudiante no interactuó con varias fases; encadenar produciría avisos y ciclos inesperados (decisiones 003 #3; caso límite de la spec).
- **Persistir también en cada tick** vs solo en transiciones: la HU exige recuperar el tiempo correcto tras cerrar desde apps recientes; solo transiciones perdería hasta una fase entera (decisiones 003 #2). Se acepta una escritura por segundo (RNF-2 se verifica midiendo en dispositivo).
- **`try/catch` + validación de forma** vs reparar JSON: reparar es complejidad innecesaria para datos pequeños y propios; degradar a defaults es siempre seguro (decisiones 003 #6).
- **Función pura `reconcile`** vs lógica de arranque en el hook: hace la HU de riesgo Alto testeable sin dispositivo (Constitución #5 y #6).

## Estrategia de pruebas con Jest

`reconcile.test.ts` (reloj simulado con `jest.setSystemTime`):

1. Sin datos → snapshot por defecto.
2. Corriendo con fin futuro → restante exacto (bloqueo simulado: ahora = fin − 3 min → restante 3 min).
3. Corriendo con fin pasado → fase `done`, siguiente preparada según el ciclo y `pendingNotice` correcto.
4. Pausado → restante idéntico al guardado y sin aviso.
5. `schemaVersion` desconocido → defaults.
6. Contador de pomodoros se conserva en la reconciliación.

`sessionSnapshot.test.ts` (AsyncStorage mockeado): guardar/cargar idéntico, JSON corrupto → defaults sin lanzar, escritura tras cada llamada de guardado.
