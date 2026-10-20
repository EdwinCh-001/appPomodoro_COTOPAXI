name: rn-conventions
description: Úsala siempre que crees o modifiques pantallas, formularios o componentes de interfaz de la app Pomodoro Academia Cotopaxi.

# Convenciones de interfaz en React Native

- Estilos con StyleSheet. Sin librerías de interfaz adicionales.
- Campos de tiempo/configuración: teclado numérico (keyboardType="number-pad").
- Los formularios y controles no deben quedar tapados por el teclado. Usa un contenedor que se desplace o ajuste, y permite tocar botones con el teclado abierto.
- Respeta las áreas seguras del dispositivo (muesca y barras del sistema).
- Listas con FlatList y una clave estable por elemento (nunca el índice).
- Etiquetas de accesibilidad en botones e iconos.
- Acciones destructivas o reinicios siempre piden confirmación con un diálogo del sistema.
- Todos los textos visibles en español.

## Lista manual de verificación en Expo Go
- [ ] Se ve bien en vertical y al girar el teléfono.
- [ ] El teclado no tapa el campo ni el botón que se está usando.
- [ ] Los tiempos se ingresan correctamente y se comportan como dice la spec.
- [ ] Cerrar la app por completo y abrirla conserva los datos/estado.
- [ ] Los textos de estado del temporizador se leen sin depender únicamente del color.