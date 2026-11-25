# Design

## Context

C-07 inicia el código de la aplicación en un repositorio que ya tiene roadmap y base de conocimiento. La motivación y el alcance están en [proposal.md](proposal.md). Los contratos de alta y consulta están en [el spec de agenda](specs/agenda-turnos/spec.md).

## Goals / Non-Goals

**Goals**

- Mantener las reglas de agenda separadas del transporte HTTP y verificarlas con un reloj inyectable.
- Garantizar que el chequeo de solapamiento y el guardado sean atómicos dentro del proceso que gestiona la agenda única.
- Dejar puertos y transiciones de estado reutilizables por los cambios posteriores.

**Non-Goals**

- Coordinar escrituras entre procesos. La persistencia duradera y la garantía de concurrencia que requiera se tratan en C-20.
- Incorporar una etapa de compilación o un chequeo estático de TypeScript al flujo del TP.

## Decisions

### PA-12 · Cero dependencias

Usar la biblioteca estándar de Node con cero dependencias de runtime y de desarrollo. Verificar con `node --test`, `node:test` y `node:assert/strict`. La alternativa de incorporar `typescript` y ejecutar `tsc --noEmit` en CI queda descartada para este cambio. El borrado nativo de tipos no realiza chequeo estático.

### PA-16 · Node 22.18.0 o superior, sin flag

Declarar `"engines": { "node": ">=22.18.0" }` y `"type": "module"`. Usar `node src/main.ts` en `start` y `node --test` en `test`. Node 22.18.0 ya habilita el borrado de tipos por defecto, por lo que tampoco hace falta elevar el mínimo a 22.19. Usar solo sintaxis TypeScript borrable, `import type` para tipos e imports relativos con extensión `.ts`.

[Publicación oficial de Node 22.18.0](https://nodejs.org/en/blog/release/v22.18.0)

### Una agenda y un proceso Node

`src/main.ts` conecta el servidor `node:http` con los adaptadores en memoria. `src/api/` lee JSON con un límite de tamaño, valida entradas como `unknown` y traduce `ReglaNegocioError` a `409` o `422` con `{ codigo, mensaje, detalle }`. El dominio en `src/agenda/` recibe puertos y reloj, y mantiene independientes las reglas de HTTP y de los adaptadores. `src/infra/` implementa los repositorios con `Map`.

Tras leer el cuerpo HTTP, el caso de uso valida las referencias y el inicio futuro, toma la duración de la prestación y calcula el fin. Verifica que el intervalo quepa en una franja, que su inicio coincida con un horario generado para esa prestación y que esté libre de bloqueos y turnos activos. El chequeo final y `guardar` son síncronos y usan el mismo repositorio compartido por los pedidos. El segundo pedido que intenta ocupar un horario ya reservado recibe `409` con `RN-TU-01` y un mensaje que indica elegir otro horario.

`estado.ts` concentra las transiciones de RN-TU-08. `puertos.ts` define `TurnosRepo` con `listarActivosEntre`, `listarPorFecha`, `guardar` y `obtener`, además de los puertos de horarios, bloqueos, prestaciones y pacientes.

### Configuración y oferta de horarios

La semilla representa la configuración previa del odontólogo. Para la demo carga una franja de 08:00 a 16:00 de lunes a viernes, una prestación activa «Consulta general» de 20 minutos, tres pacientes ficticios y un bloqueo de ejemplo. El panel de edición pertenece a un cambio posterior.

`GET /api/v1/disponibilidad?fecha=AAAA-MM-DD&prestacionId=...` devuelve una lista ordenada de intervalos con `inicio` y `fin` en ISO 8601 con offset. Valida la fecha y la prestación activa. Genera candidatos desde el inicio de cada franja en pasos iguales a la duración de la prestación. Conserva los que comienzan después del momento actual y terminan como máximo al cierre de la franja. Filtra solapamientos con bloqueos y turnos activos usando intervalos semiabiertos. Las reglas de franja y conflictos se comparten con la confirmación para que ambas operaciones evalúen el mismo horario.

La consulta refleja la disponibilidad al momento de leer y no guarda turnos. Al confirmar por `POST /api/v1/turnos` el cliente envía `pacienteId`, `prestacionId` e `inicio`. La duración la define el odontólogo en la prestación y el servidor calcula `fin`. En este flujo de reserva, enviar `duracionMinutos` devuelve `422 RN-TU-05` y enviar `fin` devuelve `422 RN-TU-06`. Un inicio que cabe en la franja pero no corresponde a un horario generado devuelve `422` con un mensaje para elegir un horario ofrecido.

### Agenda diaria por fecha local

El contrato es `GET /api/v1/turnos?fecha=AAAA-MM-DD`. La consulta por rango de US-031 se difiere. Validar que `fecha` corresponda a un día calendario y responder `422` si falta o es inválida. Interpretar la fecha y las franjas en `America/Argentina/Buenos_Aires`, con independencia de la zona horaria del servidor. Guardar fechas ISO 8601 con offset, filtrar por día local de inicio y ordenar por milisegundos. La respuesta incluye paciente, prestación y estado.

## Risks / Trade-offs

- **Los datos se pierden al reiniciar.** Documentar el comportamiento y cargar la semilla ficticia en cada arranque.
- **Un horario puede ocuparse mientras el paciente elige.** Volver a validarlo al confirmar e indicar que se elija otro si aparece un conflicto.
- **Un cambio de fecha UTC puede caer en otro día de Buenos Aires.** Probar la consulta con turnos representados con distintos offsets y usar un reloj fijo en las pruebas de alta.
- **La API carece de autenticación en C-07.** Limitar la escucha a `127.0.0.1`, usar exclusivamente datos ficticios y omitir DNI, teléfonos y contenido de mensajes en los logs.
