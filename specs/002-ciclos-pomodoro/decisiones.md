# Decisiones — 002-ciclos-pomodoro (HU-002)

- **Fecha:** 2026-10-19
- **Historia:** HU-002 — Alternar entre estudio y descanso
- **Origen:** Entrevista grill-me (8 preguntas + 1 corrección obligatoria)

## Decisiones

1. **Transición de fase: función pura `nextPhase()` en `src/domain/`** que, dado el estado actual, devuelve la siguiente fase. La UI solo la aplica. Cumple la Constitución #5.
2. **Inicio del descanso: manual.** Al terminar un estudio, el descanso queda "listo" (duración visible, tema visual de descanso) y el estudiante lo inicia con el botón Iniciar.
   *Corrección registrada:* la respuesta inicial ("automático") contradecía el criterio textual de la HU-002 ("deja listo un descanso corto **para que yo lo inicie**") y la Constitución #1; se revirtió a manual.
3. **Contador de pomodoros: se incrementa al terminar un tiempo de estudio y vuelve a cero al quedar listo el descanso largo** (es decir, al completar la cantidad configurada de pomodoros).
4. **Omitir fases: permitido solo en descansos (corto y largo).** El botón "Omitir" no aparece durante el estudio.
   *Corrección registrada:* en HU-001 los controles se definieron como "Iniciar/Pausar + Reiniciar"; el alcance de "Omitir" se limitó explícitamente a descansos para no contradecirlo.
5. **El contador de pomodoros se persiste en disco junto al resto del snapshot de sesión (HU-003).** Si cierran la app a mitad de ciclo, el ciclo continúa igual.
6. **Estados formales de una fase: `idle`, `running`, `paused`, `completed`.** `completed` permite distinguir "la fase terminó" de "aún no inicia" y sustenta los criterios de la HU.
7. **Al terminar un estudio, la pantalla principal muestra la siguiente fase como "lista"** (nombre, duración y botón Iniciar), con identidad visual diferenciada entre estudio y descanso.
8. **Avance del ciclo: fila de puntos (círculo relleno por cada pomodoro completado del ciclo) más etiqueta de texto con la fase actual y "Pomodoro N de M".**

## Riesgos y notas

- Decisión 4 añade un control ("Omitir") que no está en las HU-001–006; queda registrado aquí como alcance aprobado para que la spec lo incluya.
- Decisión 2 garantiza que el usuario mantenga el control (no hay saltos automáticos de fase).

## Enmienda (2026-10-20, decisión del usuario)

El usuario, tras probar la implementación en Expo Go, pide dos cambios que **modifican decisiones ya aprobadas**:

1. **Inicio de la siguiente fase: automático (revierte la decisión 2).** Al terminar una fase, el sistema inicia solo la siguiente, sin esperar pulsación. Contradice el texto literal de HU-002 ("deja listo un descanso corto **para que yo lo inicie**") y la corrección registrada en la entrevista; queda como decisión explícita del usuario del 2026-10-20. Requiere actualizar `spec.md` (RF-4) y el plan.
2. **Reiniciar solo en fase de estudio (concreta la decisión 4).** Durante el descanso, los controles son Pausar/Reanudar y Omitir; "Reiniciar" no aparece. La decisión 4 limitaba "Omitir" a descansos; ahora se precisa también el alcance de "Reiniciar".

## Enmienda (2026-10-20, decisión del usuario) — fin de sesión

3. **La sesión termina al acabar el descanso largo.** Al completarse el descanso largo (todos los pomodoros del ciclo hechos), el sistema **no** arranca otro estudio automáticamente: queda en el estado **"sesión terminada"** y muestra un botón **"Terminar sesión"**. El auto-inicio de la enmienda anterior sigue rigiendo para las fases **dentro** del ciclo (estudio → descanso corto → estudio), pero no para el paso al ciclo siguiente.
   *Precisión registrada (2026-10-20, tras probar en Expo Go):* en el estado "sesión terminada" la **pantalla no se reinicia**. El reloj se queda en **`00:00`** mostrando la fase que venció (el descanso largo), sin adelantar la siguiente fase. Solo al pulsar "Terminar sesión" se prepara la fase 1.
4. **"Terminar sesión" cierra el ciclo y devuelve a la fase 1 esperando Iniciar.** Al pulsarlo, el sistema prepara un ciclo nuevo desde cero usando **los mismos parámetros definidos** (duración y objetivo vigentes, no los valores por defecto), estudio con contador en 0, "Pomodoro 0 de N", **esperando** a que el usuario pulse Iniciar. No hay ciclo nuevo corriendo por sí solo.
5. **Mientras dura la sesión terminada solo se ofrece "Terminar sesión".** Iniciar/Pausar/Reanudar/Reiniciar/Omitir se ocultan en ese estado; la única acción posible es cerrar la sesión.
6. **El estado "sesión terminada" se persiste.** Si la app se cierra en ese estado y se reabre, sigue mostrándose "Terminar sesión" hasta que el usuario lo pulse (no se resetea solo). Requiere guardar el indicador en el snapshot de la spec 003 (RF-9 enmendado).

