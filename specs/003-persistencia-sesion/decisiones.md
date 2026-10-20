# Decisiones — Spec 003: Persistencia y Conteo en Segundo Plano (HU-003)

1. **Cálculo por Timestamps:** Para soportar bloqueos de pantalla o cierres de la app, el temporizador almacena el timestamp de inicio/pausa y los segundos restantes. Al reabrir, se calcula la diferencia de tiempo real transcurrido.
2. **Persistencia local:** El estado actual del temporizador, la fase y el timestamp se guardan de forma asíncrona usando `@react-native-async-storage/async-storage`.
3. **Expiración en ausencia:** Si el tiempo se cumple mientras la app estuvo cerrada, al reabrir se marca la fase como terminada y se prepara la transición correspondiente.
4. **Estado pausado:** Si la sesión estaba pausada al cerrar la aplicación, el tiempo restante se congela y no se aplican descuentos por el tiempo transcurrido.