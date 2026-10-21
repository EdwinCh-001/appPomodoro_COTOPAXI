# Spec 003 — Persistencia de la sesión

Estado: implementada
HU de origen: docs/historias/HU-003.md

## Contexto y objetivo

El celular se bloquea, la app pasa a segundo plano o el sistema la mata sin aviso. Esta spec garantiza que el temporizador no pierda el tiempo que lleva estudiado y que el ciclo continúe como si nada. Es la HU de riesgo más alto del proyecto.

## Usuarios

- Estudiante que usa la app mientras hace otras cosas en el celular y necesita que el tiempo siga siendo exacto aunque la app no esté a la vista.

## Historias de usuario

- HU-003 — Mantener el conteo con el celular bloqueado o la app cerrada (4 escenarios: bloquear, cerrar, tiempo termina con la app cerrada, pausar antes de cerrar).

## Definiciones

- **Snapshot de sesión:** el conjunto de datos guardados en el dispositivo que permite reconstruir la sesión: fase, estado, marca de tiempo de fin de fase, pomodoros del ciclo y versión del formato.
- **Reconciliación:** proceso de comparar el estado guardado con el momento actual al abrir la app y aplicar lo que haya ocurrido mientras no se usaba.

## Requisitos funcionales

- RF-1: EL SISTEMA conserva en el dispositivo el estado de la sesión (fase, estado, fin de fase, pomodoros) mientras la app esté instalada. Origen: decisiones 003 #1.
- RF-2: CUANDO el celular se bloquea o la app pasa a segundo plano con el temporizador corriendo, EL SISTEMA continúa descontando el tiempo transcurrido y al desbloquear muestra el tiempo restante correcto. Origen: HU-003 esc. "Bloquear el celular"; decisiones 003 #8.
- RF-3: CUANDO la app se cierra por completo y se vuelve a abrir con el temporizador corriendo, EL SISTEMA recupera la sesión y muestra el tiempo restante correcto. Origen: HU-003 esc. "Cerrar la aplicación".
- RF-4: CUANDO la app se reabre y el tiempo de la fase venció mientras estaba cerrada, EL SISTEMA aplica la transición pendiente (fase terminada y siguiente preparada) antes de mostrar la pantalla, y deja constancia del aviso de fin pendiente para la spec 004. Origen: HU-003 esc. "El tiempo termina con la aplicación cerrada"; decisiones 003 #3.
- RF-5: SI el estudiante pausó el temporizador antes de cerrar, ENTONCES al reabrir la app el temporizador sigue pausado con el mismo tiempo restante y no se emite ningún aviso. Origen: HU-003 esc. "Pausar antes de cerrar"; decisiones 003 #5.
- RF-6: SI los datos guardados están corruptos, incompletos o en un formato que el sistema no reconoce, ENTONCES la app descarta esos datos y arranca con los valores por defecto, sin cerrarse inesperadamente. Origen: decisiones 003 #6.
- RF-7: EL SISTEMA guarda el estado en cada cambio relevante (iniciar, pausar, reanudar, cambio de fase) y durante la cuenta en curso, de modo que ante un cierre imprevisto se pierde como máximo un segundo. Origen: decisiones 003 #2.
- RF-8: EL SISTEMA identifica la versión del formato de datos guardado y desconoce versiones no admitidas (aplica RF-6). Origen: decisiones 003 #7.
- RF-9: EL SISTEMA persiste el estado "sesión terminada" del fin de ciclo, de modo que al reabrir la app se sigue mostrando "Terminar sesión" hasta que el estudiante lo pulse. *Añadido 2026-10-20 (enmienda fin de sesión de la spec 002).* Origen: decisiones 002 #6 (enmienda fin de sesión).

## Requisitos no funcionales

- RNF-1: El cálculo del tiempo restante se basa en marcas de tiempo absolutas del sistema, no en contadores decrementales. Origen: decisiones 003 #8; skill `pomodoro-rules`.
- RNF-2: Las lecturas y escrituras del almacenamiento no degradan la fluidez del temporizador en pantalla. Origen: Constitución #3 (estado fiable sin sacrificar uso).
- RNF-3: Todo funciona sin conexión ni servidor; los datos nunca salen del dispositivo. Origen: Constitución #2; decisiones 006 #4.

## Casos límite

- Primera ejecución de la app (no hay datos guardados): arranque limpio con valores por defecto.
- El dispositivo cambia de zona horaria o el reloj se ajusta: al usar marcas de tiempo absolutas del sistema, el restante se recalcula de forma coherente.
- La fase vence con la app cerrada **y** el estudiante tarda horas en volverla a abrir: se aplica una sola transición pendiente (no se encadenan fases).
- El sistema mata la app en mitad de una escritura: la lectura posterior debe degradar a defaults sin crash (RF-6).
- El estudiante borra los datos de la app: vuelve al arranque inicial (equivalente a primera ejecución).

## Fuera de alcance

- Estadísticas agregadas o gráficos, e historial de ciclos (fuera del alcance aprobado en decisiones 006 #5; la enmienda que los incluía quedó revertida el 2026-10-20 al eliminar la spec 007).
- Cifrado del almacenamiento (decisión 006 #8).
- Notificación programada en segundo plano: su comportamiento se define en la spec 004; aquí solo se deja el estado preparado para ella.

## Criterios de finalización

- Pruebas Jest de la lógica de reconciliación y del guardado (con almacenamiento simulado) en verde.
- Lista manual en Expo Go ejecutada por el usuario: bloquear/desbloquear, cerrar desde apps recientes, tiempo vencido con app cerrada, pausar y cerrar.
- `npx tsc --noEmit` y `npm run lint` sin errores.

## Dudas abiertas

- Ninguna.
