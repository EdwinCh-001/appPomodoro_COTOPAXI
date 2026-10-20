# Spec 003 — Mantener el conteo con el celular bloqueado o la app cerrada

Estado: borrador
HU de origen: docs/historias/HU-003.md

## Contexto y objetivo
Asegurar que el temporizador Pomodoro mantenga la precisión y el conteo correcto aunque el usuario bloquee el dispositivo o cierre la aplicación por completo, evitando la pérdida de tiempo de estudio.

## Requisitos funcionales (EARS)
- RF-1: MIENTRAS el temporizador esté corriendo, CUANDO el usuario bloquee el dispositivo y lo desbloquee posteriormente, EL SISTEMA recalculará y mostrará el tiempo restante correcto descontando los segundos transcurridos. (Origen: HU-003).
- RF-2: MIENTRAS el temporizador esté corriendo, CUANDO el usuario cierre la aplicación desde las tareas recientes y la vuelva a abrir, EL SISTEMA recuperará la sesión y mostrará el tiempo restante actualizado. (Origen: HU-003).
- RF-3: CUANDO el temporizador finalice mientras la aplicación se encuentra cerrada, EL SISTEMA registrará la fase como completada y mostrará el aviso correspondiente al reabrir. (Origen: HU-003).
- RF-4: MIENTRAS el temporizador se encuentre en estado pausado, CUANDO el usuario cierre y reabra la aplicación, EL SISTEMA mantendrá exactamente el mismo tiempo restante sin alteraciones. (Origen: HU-003).

## Criterios de finalización
- Pruebas unitarias en Jest validando el cálculo del tiempo transcurrido mediante diferencias de timestamps en verde.