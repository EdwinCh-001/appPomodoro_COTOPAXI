# Tareas — Spec 005: Ajustes y Configuración

- [ ] **T1. Crear funciones puras de validación de configuración en dominio.**
  - Hecho cuando: `src/domain/settings.ts` valida límites permitidos y rechaza entradas inválidas.
- [ ] **T2. Escribir pruebas unitarias en Jest para la lógica de ajustes.**
  - Hecho cuando: `src/domain/__tests__/settings.test.ts` pasa todas las pruebas de validación en verde (`npx jest`).
- [ ] **T3. Implementar la capa de persistencia para la configuración.**
  - Hecho cuando: `src/storage/settings-storage.ts` guarda y recupera los valores personalizados correctamente.
- [ ] **T4. Crear la pantalla de ajustes (`settings.tsx`) en Expo Router.**
  - Hecho cuando: La interfaz permite modificar y guardar los tiempos aplicando la paleta de `cotopaxi-brand`.
- [ ] **T5. Verificación final de la spec.**
  - Hecho cuando: Pruebas unitarias en verde y validación manual de guardado completada.