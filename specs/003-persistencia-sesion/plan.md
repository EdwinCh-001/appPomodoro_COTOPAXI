# Plan Técnico — Spec 003: Persistencia y Conteo en Segundo Plano

## Archivos y responsabilidades
- `src/domain/timer-sync.ts`: Funciones puras para calcular el tiempo restante en función de la diferencia entre el timestamp actual y el guardado.
- `src/storage/timer-storage.ts`: Capa de persistencia usando `AsyncStorage` para guardar y recuperar el estado de la sesión.
- `src/domain/__tests__/timer-sync.test.ts`: Pruebas unitarias con Jest para el cálculo de sincronización temporal.
- `src/app/index.tsx`: Integración del hook de ciclo de vida (`AppState`) para recalcular el temporizador al volver a primer plano.