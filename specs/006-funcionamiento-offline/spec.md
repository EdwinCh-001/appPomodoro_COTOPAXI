# Spec 006 — Funcionamiento sin registro, sin internet y sin publicidad

Estado: implementada
HU de origen: docs/historias/HU-006.md

## Contexto y objetivo

La app debe ser útil apenas se instala: sin cuentas, sin conexión y sin anuncios. Esta spec no añade pantallas nuevas complejas; fija las restricciones que toda la app debe cumplir y la bienvenida mínima de la primera apertura. Actúa como guarda de calidad transversal de las demás specs.

## Usuarios

- Estudiante que instala la app y quiere empezar a estudiar en segundos, con datos móviles apagados y sin querer registrarse en nada.

## Historias de usuario

- HU-006 — Usar la aplicación sin registro, sin internet y sin publicidad (3 escenarios: primera apertura, uso sin conexión, uso sin publicidad).

## Definiciones

- **Función esencial:** temporizador, ciclos Pomodoro, avisos locales y ajustes. Todo lo que la app ofrece sin conexión.

## Requisitos funcionales

- RF-1: CUANDO el estudiante abre la app por primera vez, EL SISTEMA muestra una pantalla de bienvenida sin registro y llega al temporizador tras un toque en "Empezar". Origen: HU-006 esc. "Abrir la aplicación por primera vez"; decisiones 006 #1.
- RF-2: EL SISTEMA no solicita en ningún momento crear cuenta, iniciar sesión ni ingresar datos personales. Origen: HU-006 esc. "Abrir la aplicación por primera vez"; decisiones 006 #8.
- RF-3: MIENTRAS el dispositivo no tiene datos móviles ni wifi, EL SISTEMA permite usar el temporizador, los ciclos, los avisos locales y los ajustes con el mismo comportamiento, y los ajustes quedan guardados en el dispositivo. Origen: HU-006 esc. "Usarla sin conexión"; decisiones 006 #4.
- RF-4: EL SISTEMA no muestra publicidad en ninguna pantalla. Origen: HU-006 esc. "Usarla sin publicidad".
- RF-5: EL SISTEMA no realiza peticiones de red en tiempo de ejecución; todos los recursos visuales van incluidos en la app. Origen: decisiones 006 #3.
- RF-6: EL SISTEMA almacena como máximo: ajustes, estado de la sesión y el estado del permiso de notificaciones; nada más. Origen: decisiones 006 #5.
- RF-7: EL SISTEMA solicita únicamente el permiso de notificaciones. Origen: decisiones 006 #6.
- RF-8: EL SISTEMA no incorpora librerías de publicidad, analítica, autenticación ni reporte de errores a servidores. Origen: decisiones 006 #2.
- RF-9: La bienvenida vuelve a mostrarse si el estudiante borra los datos de la app (equivalente a una nueva instalación). Origen: decisiones 006 #1.

## Requisitos no funcionales

- RNF-1: La primera apertura debe ser útil sin internet desde el primer momento (sin descargar recursos). Origen: Constitución #2; decisiones 006 #3.
- RNF-2: Los textos de la bienvenida y de toda la app están en español y usan la identidad Cotopaxi. Origen: Constitución #7; AGENTS.md.
- RNF-3: Toda dependencia nueva pasa por la lista blanca aprobada (decisiones 006 #2) y por la aprobación del usuario antes de instalarse. Origen: AGENTS.md ("preguntar antes de instalar").

## Casos límite

- Primera apertura en modo avión: la bienvenida y el temporizador funcionan sin red (RNF-1).
- Notificaciones retrasadas por el gestor de batería del sistema: riesgo aceptado y documentado (decisión 006 #4), no se considera incumplimiento.
- El estudiante borra los datos de la app: vuelve a ver la bienvenida y a usar valores por defecto (RF-9, RF-7 de la spec 005).
- La app se usa en dispositivo sin altavoz o con vibración desactivada: el aviso visual sigue funcionando (spec 004, modo degradado).

## Fuera de alcance

- Sincronización en la nube, cuentas, historial multi-dispositivo.
- Comprobación automática de actualizaciones o telemetría de uso.
- Garantizar la entrega de notificaciones con políticas agresivas de batería (riesgo aceptado, decisión 006 #4).

## Criterios de finalización

- Lista de verificación ejecutada por el usuario en Expo Go: primera apertura en modo avión, uso completo sin conexión y ausencia de publicidad en todas las pantallas.
- Auditoría de dependencias (checklist de `tasks.md`) sin SDKs prohibidos.
- `npx tsc --noEmit`, `npm run lint` y `npx jest` en verde.

## Dudas abiertas

- Ninguna.
