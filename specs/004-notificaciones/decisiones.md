# Decisiones — Spec 004: Notificaciones y Avisos
1. Mecanismo principal: Se utiliza `expo-notifications` para programar avisos locales offline al expirar cada fase.
2. Permisos: Se solicita el permiso de notificaciones al iniciar por primera vez el temporizador, explicando su propósito educativo.
3. Comportamiento en pantalla: Si la app está abierta, se muestra simultáneamente un aviso visual dentro de la interfaz.