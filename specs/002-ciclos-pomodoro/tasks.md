# Tareas — Spec 002: Ciclos y Transiciones Pomodoro

- [ ] **T1. Crear funciones puras de transición de fases y conteo de ciclos en dominio.**
  - Hecho cuando: `src/domain/pomodoro.ts` implementa la lógica y compila sin errores (`npx tsc --noEmit`).
- [ ] **T2. Escribir pruebas unitarias en Jest para validar las reglas de descanso corto, descanso largo y reinicio de ciclo.**
  - Hecho cuando: `src/domain/__tests__/pomodoro.test.ts` pasa todas las pruebas en verde (`npx jest`).
- [ ] **T3. Actualizar la interfaz principal para visualizar la fase activa y el contador de pomodoros.**
  - Hecho cuando: `src/app/index.tsx` muestra el indicador de ciclo y fase respetando la identidad visual.
- [ ] **T4. Verificación final de la spec.**
  - Hecho cuando: Pruebas unitarias en verde y validación manual completada.