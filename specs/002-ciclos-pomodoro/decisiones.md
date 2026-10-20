# Decisiones — Spec 002: Ciclos y Transiciones Pomodoro (HU-002)

1. **Fases del ciclo:** El flujo alterna estrictamente entre Estudio -> Descanso Corto (o Descanso Largo tras completar el objetivo de pomodoros) -> Estudio.
2. **Contador de ciclo:** Se lleva la cuenta de los pomodoros completados con éxito en el ciclo actual (de 0 a 4 por defecto). Al alcanzar el objetivo, se activa el descanso largo y el contador del ciclo vuelve a 0.
3. **Estado visual:** La pantalla principal muestra claramente la fase activa ("Estudio", "Descanso Corto", "Descanso Largo") y el número de pomodoros completados del ciclo actual.
4. **Lógica pura:** Las reglas de transición de fases se implementan en funciones puras dentro de `src/domain/pomodoro.ts`.