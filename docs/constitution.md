# Constitución — Pomodoro Academia Cotopaxi

Principios innegociables. Toda spec, plan y tarea debe cumplirlos.

1. Cumplimiento de requisitos: ninguna mejora o refactorización puede eliminar ni alterar una funcionalidad obligatoria descrita en las historias de usuario del deber (HU-001 a HU-006).
2. Funcionamiento local y sin publicidad: todas las funciones esenciales operan sin servidor remoto, sin internet, sin cuentas de usuario y libre de anuncios.
3. Persistencia y estado fiables: el estado de la sesión, temporizador y ajustes deben recuperarse correctamente ante bloqueos de pantalla, reinicios y cierres de la app (según HU-003).
4. La spec manda: nada se implementa si no está en la spec activa (`specs/NNN-*/`). Si falta una decisión o regla de negocio, se detiene el desarrollo y se pregunta.
5. Lógica separada de interfaz: las reglas del temporizador y ciclos Pomodoro viven en funciones puras dentro de `src/domain/`, completamente desacopladas de React y AsyncStorage.
6. Pruebas como puerta de calidad: la lógica pura se prueba con Jest. Prohibido avanzar con pruebas en rojo o considerar terminada una tarea solo porque la interfaz se vea bien.
7. Identidad visual institucional: la interfaz gráfica debe respetar estrictamente la paleta de colores y la línea de diseño de la Academia Cotopaxi (definida en la skill `cotopaxi-brand`).