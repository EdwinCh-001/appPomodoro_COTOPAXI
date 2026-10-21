# Plan — Spec 006 Funcionamiento offline

Plan técnico para `specs/006-funcionamiento-offline/spec.md`. Decisiones: `specs/006-funcionamiento-offline/decisiones.md`. Es la spec de restricciones transversales: se implementa al final, cuando las specs 001–005 ya aportan sus piezas.

## Archivos y responsabilidades

| Archivo | Responsabilidad | RF |
|---|---|---|
| `src/app/index.tsx` (toque) | Decidir entre la pantalla de bienvenida y el temporizador según la primera apertura. | RF-1, RF-9 |
| `src/components/Welcome.tsx` | Bienvenida de una sola página: identidad Cotopaxi, texto en español, botón "Empezar"; sin campos de ningún tipo. | RF-1, RF-2, RNF-2 |
| `src/storage/welcomeFlag.ts` | Bandera local `welcomeSeen` (bandera booleana sin datos personales). Se muestra en toda instalación nueva o tras borrar datos (RF-9). | RF-1, RF-9 |
| Checklist en `tasks.md` de esta spec | Auditoría de `package.json` (lista blanca) y de código (sin peticiones de red). Es verificación, no código. | RF-5, RF-8, RNF-3 |

No hay lógica de negocio nueva que probar con Jest: la bienvenida consume la bandera y el resto de RF son restricciones que se verifican por auditoría y lista manual (Constitución #6 se cumple porque la lógica afectada ya está probada en las specs 001–005).

## Algoritmo en pseudocódigo (decisión de pantalla)

```
al montar index:
  seen = welcomeFlag.get()        // AsyncStorage, clave booleana; ausente = false
  si !seen:
     render(<Welcome onEmpezar={() => { welcomeFlag.set(true); empezar() }} />)
  sino:
     render(<Temporizador />)
```

`Welcome` no pide datos, no navega a registro (no existe) y el único destino es el temporizador. Si el estudiante borra los datos de la app, `welcomeFlag.get()` vuelve a `false` y la bienvenida reaparece (RF-9).

## Lista blanca de dependencias (RF-8, RNF-3)

Tras las specs 001–005, la lista blanca autorizada queda:

- Runtime: `expo`, `react`, `react-native`, `expo-router`, `@react-native-async-storage/async-storage`, `expo-notifications` (spec 004), `expo-audio` (spec 004), `react-native-safe-area-context`, y las utilidades de plantilla ya presentes (`expo-font`, `expo-splash-screen`, etc.).
- Pruebas: `jest`, `jest-expo`, `@types/jest`.
- **Prohibidas:** SDKs de publicidad, analítica, autenticación, *crash reporting* y clientes HTTP activos.

Cualquier paquete fuera de esta lista requiere aprobación explícita del usuario y actualización de esta spec (RNF-3; decisiones 006 #2).

## Datos y permisos (RF-6, RF-7)

Claves permitidas en AsyncStorage (inventario completo):

1. `settings@v1` — ajustes (spec 005).
2. `session@v1` — snapshot de sesión (spec 003).
3. `welcomeSeen` — bandera de bienvenida (este archivo).

*Corrección 2026-10-20 (auditoría T3):* el plan listaba una 4.ª clave `notificationPermissionAsked`, pero la spec 004 mantiene el estado del permiso **solo en memoria** y nunca lo persiste. El inventario real son las 3 claves de arriba.

Único permiso solicitado al usuario: notificaciones (spec 004). No se usan contactos, ubicación, almacenamiento externo ni cámara. `app.json` declara además `SCHEDULE_EXACT_ALARM`, un permiso de sistema que no se pide al usuario.

## Decisiones justificadas

- **Bienvenida de una página** vs directo al temporizador: la decisión de la entrevista (006 #1) pidió una bienvenida; como no pide datos ni es de registro, no contradice el criterio de la HU-006. Queda registrada la obligación de que sea descartable en un toque.
- **Bandera persistida** vs mostrarla siempre: persistir la bandera (clave booleana inofensiva) respeta "apenas la instalo" sin molestar en cada apertura; borrando datos vuelve a aparecer (RF-9).
- **Checklist manual** vs test automatizado de dependencias: la decisión 006 #7 eligió el checklist manual en `tasks.md`; un test automatizado se propone como mejora, no se implementa.
- **Auditoría al final** vs al principio: la lista blanca solo es completa cuando ya se conocen las dependencias de las specs 001–005.

## Estrategia de verificación (sustituye pruebas Jest)

- Lista manual en Expo Go: primera apertura en modo avión, flujo completo sin conexión (temporizador, ciclo, aviso local, ajustes), ausencia de publicidad en todas las pantallas y reaparición de la bienvenida tras borrar datos.
- Auditoría documentada de `package.json` contra la lista blanca.
- Búsqueda de peticiones de red en el código (`fetch`, `axios`, URLs `http`) sin resultados fuera de las dependencias ya conocidas.
