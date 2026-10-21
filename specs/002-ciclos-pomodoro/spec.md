# Spec 002 — Ciclos Pomodoro (estudio y descanso)

Estado: implementada
HU de origen: docs/historias/HU-002.md

## Contexto y objetivo

La técnica Pomodoro alterna tiempos de estudio con descansos: tras una cantidad configurada de pomodoros toca un descanso largo. Esta spec hace que la app gestione ese ciclo sola —sin que el estudiante lleve la cuenta— y que muestre su avance. Se apoya en el temporizador de la spec 001.

## Usuarios

- Estudiante que quiere seguir la técnica Pomodoro sin contar pomodoros ni decidir cuándo le toca descanso largo.

## Historias de usuario

- HU-002 — Alternar entre estudio y descanso (4 escenarios: terminar un pomodoro, llegar al descanso largo, terminar un descanso, ver mi avance).

## Definiciones

- **Pomodoro completado:** un tiempo de estudio que llega a cero sin ser omitido ni abandonado.
- **Descanso largo:** el descanso que sigue al último pomodoro del ciclo configurado (4 por defecto).
- **Fase preparada:** la siguiente fase queda lista y visible. Su inicio es **automático dentro de un ciclo en curso** (al terminar la fase anterior arranca sola); tras guardar o restablecer ajustes, en cambio, el ciclo **vuelve a empezar de cero** y solo la primera fase del ciclo nuevo espera que el estudiante pulse Iniciar (enmienda 2026-10-20 a la spec 005).

## Requisitos funcionales

- RF-1: CUANDO termina un tiempo de estudio y los pomodoros completados del ciclo son menores que el objetivo configurado, EL SISTEMA deja preparado un descanso corto. Origen: HU-002 esc. "Terminar un pomodoro"; decisiones 002 #1, #3.
- RF-2: CUANDO termina un tiempo de estudio que completa la cantidad configurada de pomodoros, EL SISTEMA deja preparado un descanso largo y el contador del ciclo vuelve a cero. Origen: HU-002 esc. "Llegar al descanso largo"; decisiones 002 #3.
- RF-3: CUANDO termina un descanso (corto o largo), EL SISTEMA deja preparado el siguiente tiempo de estudio. Origen: HU-002 esc. "Terminar un descanso"; decisiones 002 #1.
- RF-4: MIENTRAS hay una fase preparada, EL SISTEMA la muestra con su nombre y duración e inicia la cuenta automáticamente al terminar la fase anterior. *Enmendado 2026-10-20: el usuario pidió auto-inicio; sustituye el "espera a que el estudiante la inicie" original. Ver `decisiones.md`.* Origen: decisiones 002 #2 (enmendada), #7.
- RF-5: EL SISTEMA incrementa el contador de pomodoros únicamente al terminar un tiempo de estudio completo, y lo conserva al pausar o reiniciar una fase. Origen: decisiones 002 #3; HU-001 esc. "Reiniciar" (no altera el contador).
- RF-6: CUANDO la fase activa es un descanso (corto o largo), EL SISTEMA ofrece la acción "Omitir"; SI el estudiante la usa, ENTONCES el descanso termina de inmediato y se prepara la siguiente fase de estudio. Origen: decisiones 002 #4.
- RF-7: SI la fase activa es de estudio, ENTONCES no se ofrece la acción "Omitir". Origen: decisiones 002 #4.
- RF-8: EL SISTEMA muestra en la pantalla principal si la fase actual es de estudio o de descanso, y cuántos pomodoros lleva completados en el ciclo actual, mediante un indicador de puntos y un texto. Origen: HU-002 esc. "Ver mi avance"; decisiones 002 #8.
- RF-9: CUANDO el temporizador de una fase llega a cero, EL SISTEMA marca esa fase como terminada y calcula la siguiente fase según el ciclo (RF-1, RF-2 o RF-3). Origen: decisiones 002 #1, #6.
- RF-10: CUANDO termina el descanso largo del ciclo, EL SISTEMA deja la sesión en estado **"sesión terminada"** (sin arrancar un estudio nuevo) y ofrece el botón "Terminar sesión". *Precisado 2026-10-20: la pantalla no se reinicia; el reloj queda en `00:00` mostrando la fase vencida hasta que el estudiante pulse el botón.* Origen: decisiones 002 #3 (enmienda fin de sesión).
- RF-11: CUANDO el estudiante pulsa "Terminar sesión", EL SISTEMA prepara un ciclo nuevo desde cero usando los parámetros definidos por el estudiante (duración y objetivo vigentes, no los valores por defecto; fase de estudio con el contador en 0) y espera a que pulse Iniciar. Origen: decisiones 002 #4 (enmienda fin de sesión).
- RF-12: MIENTRAS la sesión está terminada, EL SISTEMA ofrece únicamente la acción "Terminar sesión"; no muestra Iniciar, Pausar, Reanudar, Reiniciar ni Omitir. Origen: decisiones 002 #5 (enmienda fin de sesión).
- RF-13: SI la app se cierra con la sesión terminada y se reabre, ENTONCES EL SISTEMA sigue mostrando "Terminar sesión" hasta que el estudiante lo pulse. Origen: decisiones 002 #6 (enmienda fin de sesión); spec 003 RF-9.

## Requisitos no funcionales

- RNF-1: Las reglas de transición (qué fase sigue, cuándo se incrementa y cuándo se reinicia el contador) viven en funciones puras y se prueban con Jest. Origen: Constitución #5 y #6.
- RNF-2: El indicador de avance usa la identidad visual Cotopaxi y el estado no depende solo del color (texto también). Origen: Constitución #7; skill `rn-conventions`.
- RNF-3: El contador de pomodoros del ciclo se conserva igual que el resto del estado de sesión (ver spec 003). Origen: decisiones 002 #5.

## Casos límite

- Ciclo configurado en 1 pomodoro: todo estudio lleva directo a descanso largo (el contador vuelve a cero tras cada estudio).
- Omitir un descanso largo: el contador ya está a cero y el siguiente estudio inicia un ciclo nuevo.
- Omitir un descanso corto: el contador conserva los pomodoros completados; el siguiente estudio puede completar el ciclo.
- Reiniciar (HU-001) una fase tras un cambio de fase: la fase preparada vuelve a su duración inicial sin tocar el contador.
- Terminar un estudio con la app en segundo plano: ver spec 003 (reconciliación) y spec 004 (aviso).

## Fuera de alcance

- Persistencia del estado y del contador al cerrar la app (spec 003).
- Avisos de fin de fase (spec 004).
- Cambiar la cantidad de pomodoros del ciclo (spec 005).

## Criterios de finalización

- Pruebas Jest de las reglas de ciclo en verde, incluidos los escenarios de pomodoros 1, 2, 3 y 4 (checklist de `pomodoro-rules`).
- `npx tsc --noEmit` y `npm run lint` sin errores.
- Lista manual en Expo Go confirmada por el usuario: avance visible, descanso no arranca solo, Omitir solo en descansos.

## Dudas abiertas

- Ninguna.
