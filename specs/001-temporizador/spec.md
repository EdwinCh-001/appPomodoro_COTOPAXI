# Spec 001 — Iniciar y controlar una sesión de estudio

Estado: borrador
HU de origen: docs/historias/HU-001.md

## Contexto y objetivo
Permitir al estudiante iniciar, pausar, reanudar y reiniciar el temporizador de estudio bajo la técnica Pomodoro, asegurando control absoluto del tiempo sin anuncios ni dependencias de red.

## Requisitos funcionales (EARS)
- RF-1: CUANDO el usuario presione iniciar en la pantalla principal, EL SISTEMA iniciará la cuenta regresiva con el tiempo configurado mostrando MM:SS. (Origen: HU-001).
- RF-2: MIENTRAS el temporizador esté corriendo, CUANDO se pause y se reanude, EL SISTEMA continuará exactamente desde el segundo pausado. (Origen: HU-001).
- RF-3: CUANDO el usuario solicite reiniciar y confirme, EL SISTEMA restablecerá el contador al tiempo inicial de la fase. (Origen: HU-001).
- RF-4: CUANDO el usuario solicite reiniciar y cancele, EL SISTEMA conservará el tiempo restante actual. (Origen: HU-001).

## Criterios de finalización
- Cobertura total de los escenarios de HU-001 mediante pruebas unitarias en Jest en verde.