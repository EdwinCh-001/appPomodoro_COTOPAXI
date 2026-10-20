# Tareas — Spec 006: Funcionamiento Offline y Sin Anuncios

- [ ] **T1. Verificar la arquitectura de la app para asegurar la entrada directa sin registro.**
  - Hecho cuando: `src/app/_layout.tsx` dirige directamente al usuario al temporizador principal al abrir la app.
- [ ] **T2. Validar la independencia total de red en todas las vistas.**
  - Hecho cuando: Se confirma que no existen llamadas a APIs remotas ni librerías externas de análisis o publicidad.
- [ ] **T3. Verificación final de la spec.**
  - Hecho cuando: La aplicación opera correctamente en modo avión/offline y sin publicidad.