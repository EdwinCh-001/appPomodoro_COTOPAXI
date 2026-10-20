name: pomodoro-rules
description: Úsala siempre que escribas, modifiques o revises código, funciones puras, pruebas o textos que calculen o gestionen los tiempos del temporizador, fases (estudio/descanso) y ciclos Pomodoro.

# Reglas del Temporizador — Pomodoro Academia Cotopaxi

## Tiempos por Defecto y Parámetros Permitidos
- **Tiempo de Estudio (Pomodoro):** 25 minutos por defecto (Rango permitido: 1 a 60 minutos).
- **Descanso Corto:** 5 minutos por defecto (Rango permitido: 1 a 30 minutos).
- **Descanso Largo:** 15 minutos por defecto (Rango permitido: 1 a 60 minutos).
- **Ciclo de Pomodoros:** 4 pomodoros completados para activar un descanso largo por defecto (Rango permitido: 1 a 10 pomodoros).

## Reglas de Transición y Estado
- El conteo de tiempo se mide estrictamente en segundos internamente.
- Al terminar el tiempo de estudio, si el contador de pomodoros es menor al objetivo del ciclo, se prepara un **descanso corto**.
- Al completar la cantidad configurada de pomodoros (por defecto 4), se prepara un **descanso largo** y el contador de pomodoros del ciclo actual se reinicia a cero.
- Al terminar cualquier descanso (corto o largo), el sistema deja lista la siguiente fase de **estudio**.
- Un temporizador en ejecución que es pausado conserva exactamente los segundos restantes.
- Reiniciar el temporizador restablece los segundos al tiempo inicial de la **fase activa actual**, sin alterar la cantidad de pomodoros completados.

## Exactitud Temporal y Persistencia
- Los cálculos de tiempo transcurrido ante bloqueos de pantalla o cierres de la app deben basarse en **marcas de tiempo (timestamps unix)** y no únicamente en contadores `setInterval` en segundo plano.
- Rechazar valores de configuración fuera de los rangos permitidos, vacíos, cero, negativos o no numéricos.

## Checklist de Revisión de Código y Pruebas
- [ ] ¿Se prueban las funciones puras de conteo con Jest (segundos restantes, transición de fases)?
- [ ] ¿Se aprueba el paso de estudio a descanso corto (pomodoros 1, 2 y 3)?
- [ ] ¿Se prueba la transición hacia descanso largo al completar el 4to pomodoro y el reinicio del contador a cero?
- [ ] ¿Se simula el cálculo con timestamps al bloquear/desbloquear o reabrir la app?
- [ ] ¿Los mensajes de estado y avisos son exactamente los definidos en la spec activa?

## Al terminar
Indica qué puntos del checklist has comprobado y cómo.