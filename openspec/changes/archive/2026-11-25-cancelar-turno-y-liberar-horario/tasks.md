# Tasks

## 1. Piezas compartidas (D7 y D8)

- [x] 1.1 Agregar `anticipacionCancelacionHoras` al tipo `Agenda` (`src/agenda/puertos.ts`) y completarla en `crearAgendaEnMemoria` con `datos.consultorio.anticipacionCancelacionHoras` (`src/infra/memoria.ts`). Verificar con un test en `tests/agenda/` que la agenda en memoria expone 24 con la semilla, y que los 36 tests de C-07 siguen en verde con `node --test`.
- [x] 1.2 Extender `crearRouter().registrar` (`src/api/router.ts`) para aceptar segmentos `:nombre` y pasar `params` como tercer argumento al manejador, buscando primero las rutas exactas. Verificar con un test HTTP que `/api/v1/turnos/:id/cancelar` recibe el `id`, que una ruta inexistente sigue respondiendo `404 RUTA_INEXISTENTE` y que los tests de C-07 siguen en verde.

## 2. Caso de uso de dominio

- [x] 2.1 Implementar `cancelarTurno(agenda, turnoId)` en `src/agenda/cancelar-turno.ts` según D1 y D2: reloj inyectado, comparación en milisegundos con `>=`, `transicionarEstado` y guardado sin `await`. Verificar que no importa `node:http` ni `src/infra/` y que no usa `new Date()` ni `Date.now`.
- [x] 2.2 C10-01 — Probar en `tests/agenda/cancelar-turno.test.ts`, con reloj fijo, que un turno `RESERVADO` cancelado 48 h antes queda `CANCELADO`, `EN_TERMINO` y con `canceladoEn` igual al momento de la cancelación (RN-CA-01).
- [x] 2.3 C10-02 — Probar que un turno `CONFIRMADO` se cancela (RN-CA-03).
- [x] 2.4 C10-03 — Probar que cancelar con exactamente 24 h es `EN_TERMINO` (RN-CA-01, borde).
- [x] 2.5 C10-04 — Probar que cancelar con 23 h 59 min es `TARDIA` (RN-CA-01, borde).
- [x] 2.6 C10-05 — Probar que cancelar 2 h antes es `TARDIA` (RN-CA-01).
- [x] 2.7 C10-06 — Probar que un turno cancelado tarde queda `CANCELADO` y nunca `AUSENTE` (RN-CA-04).
- [x] 2.8 C10-08 — Probar que cancelar un turno que empezó hace 10 min se rechaza con `RN-CA-03` y el turno sigue `RESERVADO`.
- [x] 2.9 C10-09 — Probar que cancelar en el instante exacto del inicio se rechaza con `RN-CA-03` (borde).
- [x] 2.10 C10-10 — Probar que cancelar un turno ya `CANCELADO` se rechaza con `RN-CA-03` y que el tipo y el momento de la cancelación original no cambian.
- [x] 2.11 C10-11 — Probar que cancelar un turno `ASISTIO` o `AUSENTE` se rechaza con `RN-CA-03`.

## 3. API HTTP

- [x] 3.1 Registrar `POST /api/v1/turnos/:id/cancelar` en `src/api/turnos.ts`: 200 con el turno, `404 TURNO_INEXISTENTE` y `422` desde `ReglaNegocioError`. Verificarlo con los tests de las tareas 3.2 a 3.5.
- [x] 3.2 C10-12 — Probar en `tests/api/cancelar-turno.test.ts`, con los helpers de `agenda-prueba.ts`, que la respuesta es 200 e incluye `estado`, `tipoCancelacion` y `canceladoEn` (RN-CA-01).
- [x] 3.3 C10-13 — Probar que un `id` inexistente responde 404.
- [x] 3.4 C10-14 — Probar que cancelar un turno que ya empezó responde 422 con `codigo` `RN-CA-03`.
- [x] 3.5 C10-07 — Probar en HTTP que, después de cancelar un turno de «Consulta general» a las 10:00, un `POST /api/v1/turnos` a las 10:00 del mismo día responde 201 (RN-CA-02).
- [x] 3.6 Agregar al `README.md` la sección "Cómo probar: cancelar un turno", con un ejemplo de reserva y cancelación con datos ficticios. Verificar que el ejemplo funciona tal como está escrito contra `node src/main.ts`.

## 4. Verificación integrada

- [x] 4.1 Ejecutar `node --test` y verificar que todos los tests pasan (los 36 de C-07 y los nuevos de C-10), con al menos un test por cada escenario C10-01 a C10-14.

## Workflow follow-up

- Marcar `cancelar-turno-y-liberar-horario` como `[x]` en `CHANGES.md` y agregar la línea de apply/verify/archive en `docs/bitacora-inspeccion.md`.
- Archivar el change con `/openspec-archive-change` y validar el spec principal `cancelacion-de-turnos`.
- Avisarle a Martina que reutilice los parámetros de ruta (D8) en `reprogramar-turno`.
- Abrir el PR hacia `master` con la plantilla. Lo revisa Francisco.
