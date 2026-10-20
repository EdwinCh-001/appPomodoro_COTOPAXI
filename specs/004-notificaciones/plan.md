# Plan Técnico — Spec 004: Notificaciones y Avisos

## Archivos y responsabilidades
- `src/services/notifications.ts`: Servicio para gestionar permisos y programar/cancelar notificaciones locales usando `expo-notifications`.
- `src/services/__tests__/notifications.test.ts`: Mocks y pruebas unitarias para la lógica del servicio de notificaciones.
- `src/app/index.tsx`: Integración con el temporizador para solicitar permisos en la primera ejecución y emitir alertas visuales/auditivas al finalizar cada fase.

## Estrategia de pruebas
Verificación con Jest para simular la solicitud de permisos y programación de notificaciones sin depender de un dispositivo físico, complementada con pruebas manuales en Expo Go.