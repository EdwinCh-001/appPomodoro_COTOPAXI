# Decisiones — Spec 001: Temporizador de Estudio

1. **Duración base:** 25 minutos por defecto (1500 segundos), configurables en historias posteriores.
2. **Formato:** Visualización estricta en minutos y segundos (MM:SS).
3. **Reinicio:** Requiere confirmación si el temporizador está corriendo o pausado; si se acepta, vuelve al inicio de la fase; si se cancela, mantiene el tiempo restante.
4. **Arquitectura:** Lógica pura desacoplada en `src/domain/timer.ts` para pruebas con Jest.