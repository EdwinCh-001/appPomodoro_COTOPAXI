# Tareas — Spec 003: Persistencia y Conteo en Segundo Plano

- [ ] **T1. Crear funciones puras de cálculo temporal por timestamps en dominio.**
  - Hecho cuando: `src/domain/timer-sync.ts` compila correctamente sin errores de TypeScript (`npx tsc --noEmit`).
- [ ] **T2. Escribir pruebas unitarias en Jest para simular el paso del tiempo con bloqueos y cierres.**
  - Hecho cuando: `src/domain/__tests__/timer-sync.test.ts` pasa todas sus pruebas en verde (`npx jest`).
- [ ] **T3. Implementar el módulo de almacenamiento local con AsyncStorage para el temporizador.**
  - Hecho cuando: Las funciones de guardado y carga operan sin errores de tipo.
- [ ] **T4. Conectar la sincronización temporal con el ciclo de vida de la app en la interfaz principal.**
  - Hecho cuando: `src/app/index.tsx` actualiza el contador automáticamente al volver a primer plano.
- [ ] **T5. Verificación final de la spec.**
  - Hecho cuando: Pruebas unitarias en verde y validación manual completada.