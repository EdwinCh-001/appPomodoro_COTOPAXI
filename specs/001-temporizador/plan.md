# Plan Técnico — Spec 001: Temporizador de Estudio

## Archivos y responsabilidades
- `src/domain/timer.ts`: Funciones puras de la máquina de estados del temporizador (inicio, pausa, reanudación, reinicio).
- `src/domain/__tests__/timer.test.ts`: Pruebas unitarias con Jest.
- `src/app/index.tsx`: Interfaz visual principal en Expo Router aplicando la paleta de `cotopaxi-brand`.

## Estrategia de pruebas
Pruebas unitarias automatizadas con `npx jest` para validar la precisión del conteo y la integridad de los estados.