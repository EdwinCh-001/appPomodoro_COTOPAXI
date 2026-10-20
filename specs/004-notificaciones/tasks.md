# Tareas — Spec 004: Notificaciones y Avisos

- [ ] **T1. Configurar servicio de notificaciones locales (`expo-notifications`).**
  - Hecho cuando: `src/services/notifications.ts` expone funciones para solicitar permisos y disparar alertas locales sin errores de compilación (`npx tsc --noEmit`).
- [ ] **T2. Crear pruebas unitarias con Jest para el servicio de notificaciones.**
  - Hecho cuando: `src/services/__tests__/notifications.test.ts` valida la programación de alertas en verde (`npx jest`).
- [ ] **T3. Integrar la solicitud de permisos y disparadores al finalizar el temporizador.**
  - Hecho cuando: La pantalla principal emite notificaciones locales en la transición entre estudio y descanso.
- [ ] **T4. Verificación final de la spec.**
  - Hecho cuando: Pruebas unitarias en verde y validación de notificaciones locales completada.