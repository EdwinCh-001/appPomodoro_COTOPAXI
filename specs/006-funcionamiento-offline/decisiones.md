# Decisiones — Spec 006: Acceso Offline y Sin Anuncios
1. Arquitectura de entrada: La aplicación inicia directamente en la vista del temporizador, omitiendo cualquier pantalla de autenticación o login.
2. Independencia de red: Cero llamadas a servidores externos; todo opera estrictamente en el almacenamiento local del dispositivo.
3. Ausencia de anuncios: No se integran SDKs publicitarios de terceros.