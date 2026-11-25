# Spec Delta

## Purpose

Permite que el odontólogo cancele turnos vigentes de su agenda. La cancelación se clasifica en término o tardía según la anticipación configurada, y el horario queda libre para dar otro turno.

## ADDED Requirements

### Requirement: Cancelar un turno vigente

El sistema SHALL permitir cancelar un turno en estado `RESERVADO` o `CONFIRMADO` cuyo inicio sea posterior al momento actual. El turno cancelado MUST quedar en estado `CANCELADO` y registrar el momento de la cancelación. La anticipación es el tiempo entre el momento de la cancelación y el inicio del turno, y se mide en la zona `America/Argentina/Buenos_Aires` (RN-CF-01).

#### Scenario: Cancelar un turno reservado con dos días de anticipación (caso feliz)
- **GIVEN** un turno ficticio `RESERVADO` que empieza el 2026-12-03 a las 10:00
- **AND** el momento actual es el 2026-12-01 a las 10:00 (48 h antes)
- **WHEN** el odontólogo cancela ese turno
- **THEN** el turno queda en estado `CANCELADO` con tipo de cancelación `EN_TERMINO`
- **AND** el momento de cancelación registrado es el 2026-12-01 a las 10:00

#### Scenario: Cancelar un turno confirmado
- **GIVEN** un turno `CONFIRMADO` que empieza dentro de 3 días
- **WHEN** el odontólogo cancela ese turno
- **THEN** el turno queda en estado `CANCELADO`

### Requirement: Clasificar la cancelación según la anticipación

El sistema SHALL clasificar la cancelación como `EN_TERMINO` cuando la anticipación es mayor o igual a la anticipación mínima configurada (24 h por defecto, RN-CF-02), y como `TARDIA` cuando es menor (RN-CA-01).

#### Scenario: Cancelar con exactamente 24 horas de anticipación (borde)
- **GIVEN** la anticipación mínima configurada es de 24 h
- **AND** un turno `RESERVADO` que empieza el 2026-12-02 a las 10:00
- **WHEN** el odontólogo lo cancela el 2026-12-01 a las 10:00 (exactamente 24 h antes)
- **THEN** la cancelación es `EN_TERMINO`

#### Scenario: Cancelar un minuto después del límite (borde)
- **GIVEN** la anticipación mínima configurada es de 24 h
- **AND** un turno `RESERVADO` que empieza el 2026-12-02 a las 10:00
- **WHEN** el odontólogo lo cancela el 2026-12-01 a las 10:01 (23 h 59 min antes)
- **THEN** la cancelación es `TARDIA`

#### Scenario: Cancelar con poca anticipación
- **GIVEN** la anticipación mínima configurada es de 24 h
- **AND** un turno `RESERVADO` que empieza dentro de 2 horas
- **WHEN** el odontólogo lo cancela
- **THEN** la cancelación es `TARDIA`

### Requirement: Una cancelación tardía no es una ausencia

El sistema MUST registrar una cancelación tardía como `CANCELADO` con tipo `TARDIA`, y MUST NOT convertir el turno en `AUSENTE` ni en ningún otro estado (RN-CA-04).

#### Scenario: El turno cancelado tarde no figura como ausente
- **GIVEN** un turno cancelado con tipo `TARDIA`
- **WHEN** se consulta ese turno
- **THEN** su estado es `CANCELADO` y no `AUSENTE`

### Requirement: Liberar el horario al cancelar

El sistema SHALL dejar de considerar un turno cancelado al verificar solapamientos. A partir del momento de la cancelación, su intervalo queda disponible para crear otro turno (RN-CA-02).

#### Scenario: Dar un turno nuevo en el horario liberado
- **GIVEN** un turno `RESERVADO` de 10:00 a 10:30 de un día con atención
- **AND** ese turno se canceló
- **WHEN** el odontólogo crea otro turno de 10:00 a 10:30 ese mismo día
- **THEN** el turno nuevo se crea sin error de solapamiento

### Requirement: Rechazar la cancelación de turnos no cancelables

El sistema MUST rechazar la cancelación cuando el turno ya empezó (el momento actual es igual o posterior a su inicio) o cuando está en un estado final (`CANCELADO`, `ASISTIO` o `AUSENTE`). Debe responder con el código de regla `RN-CA-03` y sin modificar el turno (RN-CA-03, RN-TU-08).

#### Scenario: Cancelar un turno que ya empezó (error de negocio)
- **GIVEN** un turno `RESERVADO` que empezó hace 10 minutos
- **WHEN** el odontólogo intenta cancelarlo
- **THEN** la operación se rechaza con el código `RN-CA-03`
- **AND** el turno sigue en estado `RESERVADO`

#### Scenario: Cancelar en el instante exacto de inicio (borde)
- **GIVEN** un turno `RESERVADO` que empieza a las 10:00
- **WHEN** el odontólogo intenta cancelarlo exactamente a las 10:00
- **THEN** la operación se rechaza con el código `RN-CA-03`

#### Scenario: Cancelar un turno ya cancelado
- **GIVEN** un turno en estado `CANCELADO`
- **WHEN** el odontólogo intenta cancelarlo otra vez
- **THEN** la operación se rechaza con el código `RN-CA-03`
- **AND** el tipo y el momento de la cancelación original no cambian

#### Scenario: Cancelar un turno con asistencia registrada
- **GIVEN** un turno en estado `ASISTIO` o `AUSENTE`
- **WHEN** el odontólogo intenta cancelarlo
- **THEN** la operación se rechaza con el código `RN-CA-03`

### Requirement: Cancelar por HTTP

El sistema SHALL exponer la cancelación en `POST /api/v1/turnos/{id}/cancelar`, solo en la interfaz local (DD-15). Una cancelación exitosa responde 200 con el turno actualizado. Un turno inexistente responde 404. Un rechazo de negocio responde 422 con el cuerpo `{ codigo, mensaje, detalle }`.

#### Scenario: Respuesta exitosa
- **GIVEN** un turno `RESERVADO` con 48 h de anticipación
- **WHEN** se envía `POST /api/v1/turnos/{id}/cancelar`
- **THEN** la respuesta es 200
- **AND** el cuerpo incluye el estado `CANCELADO`, el tipo de cancelación y el momento de cancelación

#### Scenario: Turno inexistente
- **WHEN** se envía `POST /api/v1/turnos/{id}/cancelar` con un `id` que no existe
- **THEN** la respuesta es 404

#### Scenario: Rechazo de negocio por HTTP
- **GIVEN** un turno que ya empezó
- **WHEN** se envía `POST /api/v1/turnos/{id}/cancelar`
- **THEN** la respuesta es 422 con `codigo` igual a `RN-CA-03`
