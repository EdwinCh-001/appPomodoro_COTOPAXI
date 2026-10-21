# Spec 001 — Temporizador de estudio

Estado: implementada
HU de origen: docs/historias/HU-001.md

## Contexto y objetivo

El estudiante necesita concentrarse durante un tiempo definido sin hacer el conteo él mismo. Esta spec cubre el temporizador básico de la app: iniciar, pausar, reanudar y reiniciar una fase de estudio, mostrando siempre el tiempo restante. Es la pieza sobre la que se apoyan las specs 002 (ciclos), 003 (persistencia) y 004 (avisos).

## Usuarios

- Estudiante de la Academia Cotopaxi que usa la app en su celular personal, a veces con la pantalla bloqueada o cambiando de app.

## Historias de usuario

- HU-001 — Iniciar y controlar una sesión de estudio (4 escenarios: iniciar, pausar/continuar, reiniciar, cambiar de opinión al reiniciar).

## Definiciones

- **Fase:** período de tiempo configurado (estudio, descanso corto o descanso largo) con una duración y un estado.
- **Estado de fase:** `lista` (preparada, sin iniciar), `en curso`, `pausada`, `terminada` (llegó a cero).

## Requisitos funcionales

- RF-1: CUANDO el estudiante pulsa Iniciar en una fase lista, EL SISTEMA comienza la cuenta regresiva con la duración configurada de esa fase y muestra los minutos y segundos restantes. Origen: HU-001 esc. "Iniciar el temporizador"; decisiones 001 #6.
- RF-2: MIENTRAS una fase está en curso, EL SISTEMA muestra en todo momento el tiempo restante correcto en formato mm:ss. Origen: HU-001 esc. "Iniciar el temporizador"; decisiones 001 #6.
- RF-3: CUANDO el estudiante pausa una fase en curso, EL SISTEMA detiene la cuenta y conserva el tiempo restante exacto. Origen: HU-001 esc. "Pausar y continuar".
- RF-4: CUANDO el estudiante reanuda una fase pausada, EL SISTEMA continúa la cuenta desde el tiempo en que se pausó. Origen: HU-001 esc. "Pausar y continuar".
- RF-5: CUANDO el estudiante pulsa Reiniciar con una fase en curso o pausada, EL SISTEMA solicita confirmación antes de reiniciar. Origen: HU-001 esc. "Reiniciar el temporizador"; decisiones 001 #4.
- RF-6: SI el estudiante confirma el reinicio, ENTONCES el temporizador vuelve al tiempo inicial de la fase en la que está, sin alterar los pomodoros completados del ciclo. Origen: HU-001 esc. "Reiniciar el temporizador"; decisiones 001 #8.
- RF-7: SI el estudiante cancela la confirmación, ENTONCES el temporizador conserva el tiempo que llevaba y su estado (en curso sigue en curso, pausada sigue pausada). Origen: HU-001 esc. "Cambiar de opinión al reiniciar".
- RF-8: EL SISTEMA ofrece iniciar, pausar/reanudar y reiniciar directamente en la pantalla principal, sin navegación adicional. Origen: decisiones 001 #5, #7.
- RF-9: CUANDO el tiempo restante de una fase en curso llega a cero, EL SISTEMA muestra la fase como terminada en 00:00 (la preparación de la siguiente fase la define la spec 002). Origen: decisiones 002 #6 (estado `completed`).

## Requisitos no funcionales

- RNF-1: EL SISTEMA calcula el tiempo restante a partir de marcas de tiempo absolutas del sistema, de modo que retrasos del dispositivo no lo desincronicen. Origen: decisiones 001 #1, #3; Constitución #5.
- RNF-2: Toda la lógica del temporizador vive en funciones puras, desacopladas de la interfaz y del almacenamiento. Origen: Constitución #5.
- RNF-3: La pantalla principal usa la identidad visual de la Academia Cotopaxi (paleta y contrastes de la skill `cotopaxi-brand`). Origen: Constitución #7.
- RNF-4: Los textos visibles están en español y los controles tienen etiquetas de accesibilidad. Origen: AGENTS.md; skill `rn-conventions`.

## Casos límite

- Fase de 1 minuto (mínimo permitido): el temporizador debe mostrar 01:00 → 00:00 correctamente.
- Pausar inmediatamente tras iniciar (restante casi igual a la duración).
- Reiniciar una fase que ya está en 00:00 (no debe provocar estados incoherentes).
- Girar el dispositivo o perder el foco mientras corre: el estado en pantalla no cambia (el cálculo exacto tras bloqueo lo garantiza la spec 003).
- Pulsar Iniciar dos veces seguidas: la segunda pulsación no debe reiniciar ni duplicar la cuenta.

## Fuera de alcance

- Transiciones entre fases y contador de pomodoros (spec 002).
- Persistencia del estado al cerrar/bloquear (spec 003).
- Avisos y notificaciones de fin de fase (spec 004).
- Configuración de duraciones (spec 005).

## Criterios de finalización

- Todas las pruebas Jest de la lógica pura en verde (`npx jest`).
- `npx tsc --noEmit` y `npm run lint` sin errores.
- Lista manual de verificación de la skill `rn-conventions` probada en Expo Go por el usuario.

## Dudas abiertas

- Ninguna.
