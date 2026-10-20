# Plan Técnico — Spec 002: Ciclos y Transiciones Pomodoro

## Archivos y responsabilidades
- `src/domain/pomodoro.ts`: Funciones puras para manejar la máquina de estados de los ciclos y las transiciones de fases.
- `src/domain/__tests__/pomodoro.test.ts`: Pruebas unitarias en Jest de la lógica de ciclos.
- `src/app/index.tsx`: Actualización de la interfaz para reflejar la fase actual y el indicador de pomodoros completados bajo `cotopaxi-brand`.