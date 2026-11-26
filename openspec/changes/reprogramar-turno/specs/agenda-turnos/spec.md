# Agenda de turnos: reprogramación

## ADDED Requirements

### Requirement: Reprogramar un turno válido

El sistema MUST permitir reprogramar un turno activo que todavía no empezó. El destino debe cumplir las reglas de agenda, permitiendo inicios fuera de la grilla y excluyendo al original del chequeo de solapamientos. El nuevo turno MUST quedar en estado `RESERVADO`. (RN-TU-01 a RN-TU-09)

#### Scenario: Reprogramación a un horario libre

- **GIVEN** un turno `RESERVADO` o `CONFIRMADO` cuyo inicio todavía no llegó, y un destino válido sin conflictos
- **WHEN** el odontólogo solicita reprogramarlo
- **THEN** el sistema responde 200 con el turno nuevo enlazado al original mediante `reprogramadoDesdeId`
- **AND** el original queda `CANCELADO` con tipo `EN_TERMINO`
- **AND** el turno nuevo queda en estado `RESERVADO` (RN-TU-08, RN-TU-09)

#### Scenario: El destino solo se superpone con el turno original

- **GIVEN** un turno activo que todavía no empezó y un destino que se superpone con el original, pero no con otro turno activo
- **WHEN** se solicita la reprogramación
- **THEN** el sistema excluye el original al comprobar solapamientos y permite continuar si se cumplen las demás reglas (RN-TU-01, RN-TU-09)

#### Scenario: Reprogramación fuera de la grilla mediante un desplazamiento de 15 minutos

- **GIVEN** un turno activo de 20 minutos reservado de 09:00 a 09:20, cuyo inicio todavía no llegó
- **AND** una franja de atención de 08:00 a 16:00 con una prestación de 20 minutos
- **AND** un destino sin bloqueos ni solapamientos con otros turnos activos
- **WHEN** el odontólogo solicita reprogramarlo a las 09:15 sin indicar una duración diferente
- **THEN** el sistema responde 200 aunque el nuevo inicio no coincida con la grilla de horarios ofrecidos
- **AND** el turno nuevo queda `RESERVADO` de 09:15 a 09:35
- **AND** el original queda `CANCELADO` con tipo `EN_TERMINO`
- **AND** el nuevo turno queda vinculado al original mediante `reprogramadoDesdeId` (RN-TU-01, RN-TU-02, RN-TU-05, RN-TU-06, RN-TU-09)

#### Scenario: Reprogramación con menos de 24 horas de anticipación

- **GIVEN** un turno activo que todavía no empezó y cuyo inicio está a menos de 24 horas
- **WHEN** se reprograma a un destino válido
- **THEN** el original queda `CANCELADO` con tipo `EN_TERMINO`, nunca `TARDIA` (RN-TU-09)

### Requirement: Determinar la duración del turno nuevo

El sistema MUST utilizar la duración por defecto de la prestación cuando se omite `duracionMinutos`. Si se indica una duración, MUST validar que sea un número entero entre 5 y 480 minutos inclusive y múltiplo de 5. El sistema MUST calcular el fin a partir del inicio y la duración. (RN-TU-05, RN-TU-06)

#### Scenario: Se utiliza la duración de la prestación si no se envía duración

- **GIVEN** un turno original cuya duración registrada difiere de la duración por defecto de la prestación
- **AND** una solicitud válida que no incluye `duracionMinutos`
- **WHEN** se procesa la reprogramación
- **THEN** el turno nuevo utiliza la duración por defecto de la prestación y calcula `fin` a partir del nuevo inicio y esa duración (RN-TU-05, RN-TU-06, RN-TU-09)

#### Scenario: Se usa la duración enviada cuando está presente

- **GIVEN** un turno original activo que todavía no empezó y una duración explícita válida en la solicitud
- **WHEN** se solicita la reprogramación
- **THEN** el turno nuevo usa la duración enviada y calcula `fin` a partir del nuevo inicio (RN-TU-05, RN-TU-06, RN-TU-09)

### Requirement: Rechazar destinos inválidos sin alterar el turno original

El sistema MUST rechazar destinos que incumplan las reglas aplicables de agenda y conservar el original sin cambios. El destino debe ser estrictamente futuro, caber en una única franja de atención y no superponerse con bloqueos ni con otros turnos activos. La falta de coincidencia con la grilla no constituye un motivo de rechazo. (RN-TU-01, RN-TU-02, RN-TU-03, RN-TU-04, RN-TU-05, RN-TU-07, RN-TU-09)

#### Scenario: El destino se superpone con otro turno activo

- **GIVEN** un turno original activo y otro turno activo distinto que se superpone con el destino
- **WHEN** se solicita la reprogramación
- **THEN** el sistema responde 409 con el código `RN-TU-01`
- **AND** el original conserva todos sus datos y estado
- **AND** no se guarda un turno nuevo

#### Scenario: El destino está fuera del horario de atención

- **GIVEN** un turno original activo y un destino que no cabe en una sola franja de atención
- **WHEN** se solicita la reprogramación
- **THEN** el sistema responde 422 con el código `RN-TU-02`
- **AND** no modifica ni reemplaza el turno original

#### Scenario: El destino se superpone con un bloqueo

- **GIVEN** un turno original activo y un destino que se superpone con un bloqueo
- **WHEN** se solicita la reprogramación
- **THEN** el sistema responde 409 con el código `RN-TU-03`
- **AND** no modifica ni reemplaza el turno original

#### Scenario: El destino no empieza en el futuro

- **GIVEN** un turno original activo y un destino cuyo inicio es anterior o igual al momento actual
- **WHEN** se solicita la reprogramación
- **THEN** el sistema responde 422 con el código `RN-TU-04`
- **AND** no modifica ni reemplaza el turno original

#### Scenario: La duración del destino es inválida

- **GIVEN** un turno original activo y una duración que no es un número entero entre 5 y 480 minutos inclusive o que no es múltiplo de 5
- **WHEN** se solicita la reprogramación
- **THEN** el sistema responde 422 con el código `RN-TU-05`
- **AND** no modifica ni reemplaza el turno original

#### Scenario: El turno original no existe

- **GIVEN** un identificador que no corresponde a ningún turno
- **WHEN** se solicita la reprogramación
- **THEN** el sistema responde 404
- **AND** no crea un turno nuevo (RN-TU-09)

### Requirement: Rechazar un turno original no reprogramable

El sistema MUST rechazar la reprogramación si el turno original ya empezó o no puede transicionarse conforme a RN-TU-08. (RN-TU-08, RN-TU-09)

#### Scenario: El turno original ya empezó

- **GIVEN** un turno original `RESERVADO` o `CONFIRMADO` cuyo inicio ya llegó
- **WHEN** se solicita la reprogramación
- **THEN** el sistema responde 422 con el código `RN-TU-09`
- **AND** no modifica el original ni crea otro turno

#### Scenario: El turno original está en estado final

- **GIVEN** un turno original en estado `CANCELADO`, `ASISTIO` o `AUSENTE`
- **WHEN** se solicita la reprogramación
- **THEN** el sistema responde 422 con el código `RN-TU-08`
- **AND** no modifica el original ni crea otro turno

### Requirement: Guardar la reprogramación sin intercalado

El caso de uso MUST calcular todos los datos necesarios antes de la primera escritura. Debe verificar conflictos y guardar el original cancelado y el turno nuevo sin ningún `await` entre la verificación de solapamiento y las escrituras. (RN-TU-09, RN-TU-10)

#### Scenario: Dos solicitudes de reprogramación concurrentes producen destinos incompatibles

- **GIVEN** dos solicitudes de reprogramación concurrentes de turnos originales distintos cuyos destinos se superponen
- **WHEN** ambas se procesan en el mismo proceso Node
- **THEN** como máximo una persiste
- **AND** el pedido que no persiste recibe 409 con el código `RN-TU-01`
- **AND** no queda una reprogramación parcialmente aplicada (RN-TU-10)