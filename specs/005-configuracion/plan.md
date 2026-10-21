# Plan — Spec 005 Configuración

Plan técnico para `specs/005-configuracion/spec.md`. Decisiones: `specs/005-configuracion/decisiones.md`. Depende de las specs 001–003 (el temporizador, el ciclo y la persistencia ya existen).

## Archivos y responsabilidades

| Archivo | Responsabilidad | RF |
|---|---|---|
| `src/domain/settings.ts` | Valores por defecto, rangos permitidos (constante única), validación pura de entradas. | RF-2, RF-3, RF-7, RNF-1 |
| `src/domain/__tests__/settings.test.ts` | Pruebas Jest de validación y defaults. | RNF-1 |
| `src/storage/settingsStore.ts` | Clave propia `settings@v1` en AsyncStorage: cargar, guardar y restablecer con validación y fallback a defaults. | RF-6, RF-7 |
| `src/storage/__tests__/settingsStore.test.ts` | Pruebas con AsyncStorage mockeado. | RNF-1 |
| `src/app/settings.tsx` | Pantalla de ajustes: campos numéricos, mensajes inline, botones Guardar y Restablecer con confirmación. | RF-1, RF-3, RF-4, RNF-2, RNF-3 |
| `src/hooks/useSettings.ts` | Expone ajustes actuales y funciones de guardado; los consumidores (timer, ciclo) leen de aquí. | RF-1, RF-5, RF-8 |
| `src/hooks/useTimer.ts` + `src/domain/timer.ts` (toque mínimo) | La fase en curso guarda la duración con la que empezó; los cambios de ajustes no la alteran (RF-5). | RF-5 |

## Funciones puras (src/domain/settings.ts)

- `DEFAULT_SETTINGS = { studyMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15, pomodorosPerCycle: 4 }`
- `RANGES = { study: [1, 60], shortBreak: [1, 30], longBreak: [1, 60], pomodoros: [1, 10] }` ← **constante única; el rango de estudio es 1–60 según la enmienda del usuario del 2026-10-19 (alineada con `pomodoro-rules`).**
- `parseSettingsInput(raw)` → convierte strings del formulario a números o `null` si no es entero válido.
- `validateSettings(raw)` → `{ ok: true, settings } | { ok: false, errors: {campo: 'mensaje en español' } }`. Cubre vacío, cero, negativo, no numérico, fuera de rango y límites exactos.

## Algoritmo en pseudocódigo (guardar)

```
al pulsar "Guardar ajustes":
  resultado = validateSettings(campos)
  si !resultado.ok:
     mostrar mensaje inline por campo   // RF-3: no se guarda NADA
  sino:
     settingsStore.save(resultado.settings)
     hookSettings.actualizar(resultado.settings)
     navegar de vuelta

restablecer:
  Alert("¿Restablecer los valores por defecto?") → confirmar
  settingsStore.save(DEFAULT_SETTINGS)
  // no toca la sesión en curso (RF-8)

fase en curso (RF-5):
  al iniciar una fase: duraciónFase = settings.vigente(tipoFase)   // "vigente" = en ese instante
  al cambiar ajustes mientras corre o pausa: la fase ya tiene su duración guardada; nada cambia
```

## Interfaz (`src/app/settings.tsx`)

- Ruta propia bajo `src/app/` (aprobado en decisiones 001 #7). Encabezado `#001F3F`, campos `#FFFFFF` sobre fondo `#E2E4E9` (skill `cotopaxi-brand`).
- Cuatro campos con `keyboardType="number-pad"` (skill `rn-conventions`), envueltos en un contenedor desplazable para que el teclado no tape campos ni botones.
- Mensaje de error inline debajo del campo, color `#D33724`, en español con el rango permitido; el estado no depende solo del color (texto).
- Botón primario "Guardar ajustes" (`#357CA5`) y botón "Restablecer valores por defecto" con confirmación `Alert` (acción destructiva `#D33724`).
- Etiquetas de accesibilidad en todos los controles.

## Decisiones justificadas

- **Botón Guardar** vs guardado automático: la HU dice "cambio un tiempo y guardo"; con guardado automático los mensajes de error y el descarte de valores inválidos serían ambiguos (decisiones 005 #4).
- **Campo numérico** vs stepper/slider: es el único control que permite el escenario "dejo un campo vacío" de la HU; stepper nunca estaría vacío (decisiones 005 #3).
- **Clave propia de ajustes** vs snapshot único: un futuro "restablecer sesión" no debe borrar los ajustes del estudiante; además se cargan antes del primer render (decisiones 005 #8).
- **Validar todo junto antes de guardar** vs guardar campo por campo: la HU exige "no guarda el cambio" ante un valor inválido; guardar por campo dejaría ajustes a medias (RF-3).
- **Duración fijada al iniciar la fase** vs leer ajustes en cada tick: hace que RF-5 sea una propiedad estructural, no una comprobación dispersa.

## Estrategia de pruebas con Jest

`src/domain/__tests__/settings.test.ts`:

1. Defaults correctos (25/5/15/4) y coherentes con `pomodoro-rules`.
2. Campos vacíos, cero, negativos, no numéricos y fuera de rango → `ok: false` con mensaje por campo.
3. Límites exactos de cada rango → válidos.
4. `parseSettingsInput`: "25" → 25, "25.5" → inválido, " 12 " con espacios → 12, "-1" → inválido.

`src/storage/__tests__/settingsStore.test.ts`: guardar→cargar idéntico, clave ausente → defaults, clave ilegible → defaults sin lanzar.
