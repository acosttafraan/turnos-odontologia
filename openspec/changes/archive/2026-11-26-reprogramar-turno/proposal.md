
# Propuesta: reprogramar-turno

## Why

El odontólogo necesita mover un turno existente a otro horario sin perder el historial ni permitir reservas incompatibles con las reglas de agenda.

## What Changes

Agregar `PUT /api/v1/turnos/{id}/reprogramar`. El sistema validará el turno destino con las reglas de creación, excluyendo el original del chequeo de solapamiento. Si la validación resulta satisfactoria, el original quedará cancelado en término y se creará un turno nuevo enlazado a él, en estado `RESERVADO`.

Si la validación falla, el original permanecerá intacto y no se guardará un turno nuevo.

## Alcance

- Caso de uso de reprogramación en el dominio de agenda.
- Ruta HTTP y respuestas de éxito y error.
- Validaciones RN-TU-01 a RN-TU-09 y garantía de concurrencia RN-TU-10.
- Actualización futura del README con instrucciones para probar la funcionalidad.

## Fuera de alcance

- Cambios de interfaz web.
- Cambios en la cancelación explícita de turnos.
- Persistencia duradera o soporte de varios procesos.
- Cambios a los puertos o a `src/infra/`.
- Cambios al modelo de pacientes, prestaciones u horarios.

## Referencias

- C-11 en `CHANGES.md`.
- US-032.
- F-03.
- RN-TU-01 a RN-TU-10, RN-TU-08 y RN-TU-09.
- DD-08, DD-10 y DD-14.