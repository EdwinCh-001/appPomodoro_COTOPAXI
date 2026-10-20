# Plan Técnico — Spec 006: Funcionamiento Offline y Sin Anuncios

## Archivos y responsabilidades
- `src/app/_layout.tsx`: Configuración del layout raíz para garantizar la navegación directa al temporizador sin pantallas de login o registros.
- `src/app/index.tsx`: Asegurar que la pantalla principal funcione 100% de manera autónoma sin llamadas HTTP ni dependencias de red.
- `app.json`: Configuración del proyecto Expo libre de SDKs o librerías publicitarias de terceros.

## Estrategia de pruebas
Pruebas de integración de componentes para verificar la ausencia de llamadas de red y la entrada directa al temporizador.