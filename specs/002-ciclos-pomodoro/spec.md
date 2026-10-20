# Spec 002 — Alternar entre estudio y descanso

Estado: borrador
HU de origen: docs/historias/HU-002.md

## Contexto y objetivo
Automatizar la transición de fases (estudio y descansos cortos o largos) y mostrar el progreso del ciclo Pomodoro actual para que el estudiante siga la técnica sin esfuerzo manual.

## Requisitos funcionales (EARS)
- RF-1: CUANDO termine un tiempo de estudio y el número de pomodoros completados sea menor al objetivo del ciclo, EL SISTEMA dejará listo un descanso corto para su inicio. (Origen: HU-002).
- RF-2: CUANDO termine el tiempo de estudio que completa la cantidad configurada de pomodoros, EL SISTEMA dejará listo un descanso largo y restablecerá el contador de pomodoros del ciclo a cero. (Origen: HU-002).
- RF-3: CUANDO termine cualquier descanso (corto o largo), EL SISTEMA dejará listo el siguiente tiempo de estudio. (Origen: HU-002).
- RF-4: MIENTRAS el usuario se encuentre en una sesión, EL SISTEMA mostrará en la pantalla principal la fase activa (estudio o descanso) y la cantidad de pomodoros acumulados en el ciclo actual. (Origen: HU-002).

## Criterios de finalización
- Cobertura de las transiciones de fases y conteo de ciclos mediante pruebas unitarias en Jest en verde.