# Decisiones — Spec 005: Ajustes y Configuración
1. Navegación: Se implementa un navegador de pestañas inferiores en Expo Router para separar la pantalla principal de la vista de ajustes.
2. Persistencia de ajustes: Los valores modificados se guardan localmente mediante `@react-native-async-storage/async-storage`.
3. Validación de rangos: Se rechazan valores vacíos, ceros o fuera de los límites permitidos, indicando el error al usuario.