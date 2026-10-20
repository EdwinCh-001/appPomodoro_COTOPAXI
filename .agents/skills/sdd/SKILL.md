name: sdd
description: Úsala siempre que trabajes con Spec-Driven Development en este proyecto (docs/constitution.md, docs/historias/ o cualquier archivo de specs/): redactar, revisar o cambiar specs, planes y tareas, o implementar y validar tareas de una spec.

# Spec-Driven Development (SDD)

## Flujo
Constitución -> grill-me -> Spec -> Clarificación -> Plan -> Tareas -> Implementación -> Validación -> Cambio.

- Nunca pases a la siguiente fase sin la aprobación explícita del usuario.
- La spec manda: si algo no está en la spec, no se implementa. Si falta una decisión, para y pregunta. Al redactar la spec (/sdd-spec) no preguntes: márcala [NECESITA ACLARACIÓN] y no la resuelvas tú.
- Un cambio de requisitos se hace primero en la spec, luego en el plan y las tareas, y por último en el código.
- Cada spec vive en specs/NNN-nombre/ con decisiones.md, spec.md, plan.md y tasks.md. decisiones.md lo genera grill-me; solo grill-me o el usuario lo modifican, el agente no añade decisiones por su cuenta.
- Al terminar cada fase, actualiza MEMORY.md.

## Plantilla de spec (spec.md)
# Spec NNN — <Nombre>

Estado: borrador | aprobada | implementada
HU de origen: docs/historias/HU-00N.md

## Contexto y objetivo
## Usuarios
## Historias de usuario
## Definiciones (solo si hay términos que puedan interpretarse de varias formas)
## Requisitos funcionales
## Requisitos no funcionales
## Casos límite
## Fuera de alcance
## Criterios de finalización
## Dudas abiertas
- [NECESITA ACLARACIÓN] <duda>

La spec describe el QUÉ y el POR QUÉ. Nada de stack, arquitectura ni nombres de archivos.

## Requisitos en EARS (en español)
- RF-x: CUANDO <evento>, EL SISTEMA <respuesta>.
- RF-x: SI <condición no deseada>, ENTONCES EL SISTEMA <respuesta>.
- RF-x: MIENTRAS <estado>, EL SISTEMA <respuesta>.
- RF-x: EL SISTEMA <comportamiento permanente>.

Cada RF debe ser verificable y terminar con "Origen:", indicando el escenario de la HU o la decisión de decisiones.md de la que sale. Cada escenario de la HU debe quedar cubierto por al menos un RF.

## Plan (plan.md)
Archivos y responsabilidades · Funciones puras · Persistencia · Algoritmo en pseudocódigo · Interfaz · Decisiones justificadas con su alternativa descartada · Estrategia de pruebas con Jest. Indica qué RF cubre cada parte.

## Tareas (tasks.md)
- [ ] **Tn. <Descripción>.** RF-x, RF-y
- Hecho cuando: <comprobación verificable>.

Máximo 20-30 min por tarea, en orden de dependencia. Si salen más de 10, propón dividir la spec.

## Implementación
Una sola tarea cada vez: pruebas primero (en rojo), después el código, npx jest en verde, marcar la tarea y parar. Si la tarea toca la interfaz, entrega la lista manual de verificación y espera a que el usuario confirme que la probó en Expo Go antes de marcarla como hecha.