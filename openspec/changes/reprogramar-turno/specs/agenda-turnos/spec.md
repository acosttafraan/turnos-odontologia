# Agenda de turnos: reprogramación

## ADDED Requirements

### Requirement: Reprogramar un turno válido

El sistema MUST aceptar una reprogramación de un turno activo que todavía no empezó cuando el turno destino cumple las reglas de creación, excepto que el turno original queda excluido del chequeo de solapamientos. El turno nuevo MUST quedar en estado `RESERVADO`. (RN-TU-01, RN-TU-02, RN-TU-03, RN-TU-04, RN-TU-05, RN-TU-07, RN-TU-08, RN-TU-09)

#### Scenario: Reprogramación a un horario libre

- **Dado** un turno `RESERVADO` o `CONFIRMADO` cuyo inicio todavía no llegó, y un destino válido sin conflictos
- **Cuando** el odontólogo solicita reprogramarlo
- **Entonces** el sistema responde 200 con el turno nuevo enlazado al original mediante `reprogramadoDesdeId`
- **Y** el original queda `CANCELADO` con tipo `EN_TERMINO`
- **Y** el turno nuevo queda en estado `RESERVADO` (RN-TU-08, RN-TU-09)

#### Scenario: El destino solo se superpone con el turno original

- **Dado** un turno activo que todavía no empezó y un destino que se superpone con el original, pero no con otro turno activo
- **Cuando** se solicita la reprogramación
- **Entonces** el sistema excluye el original al comprobar solapamientos y permite continuar si se cumplen las demás reglas (RN-TU-01, RN-TU-09)

#### Scenario: Se conserva la duración original si no se envía duración

- **Dado** un turno original con una duración registrada
- **Y** una solicitud válida que no incluye `duracionMinutos`
- **Cuando** se procesa la reprogramación
- **Entonces** el turno nuevo conserva la duración del original y calcula `fin` a partir del nuevo inicio y esa duración (RN-TU-05, RN-TU-06, RN-TU-09)

#### Scenario: Se usa la duración enviada cuando está presente

- **Dado** un turno original activo que todavía no empezó y una duración explícita válida en la solicitud
- **Cuando** se solicita la reprogramación
- **Entonces** el turno nuevo usa la duración enviada y calcula `fin` a partir del nuevo inicio (RN-TU-05, RN-TU-06, RN-TU-09)

#### Scenario: Reprogramación con menos de 24 horas de anticipación

- **Dado** un turno activo que todavía no empezó y cuyo inicio está a menos de 24 horas
- **Cuando** se reprograma a un destino válido
- **Entonces** el original queda `CANCELADO` con tipo `EN_TERMINO`, nunca `TARDIA` (RN-TU-09)

### Requirement: Rechazar destinos inválidos sin alterar el turno original

El sistema MUST rechazar una reprogramación cuyo turno destino incumpla una regla de creación y MUST dejar el turno original sin cambios. (RN-TU-01, RN-TU-02, RN-TU-03, RN-TU-04, RN-TU-05, RN-TU-07, RN-TU-09)

#### Scenario: El destino se superpone con otro turno activo

- **Dado** un turno original activo y otro turno activo distinto que se superpone con el destino
- **Cuando** se solicita la reprogramación
- **Entonces** el sistema responde 409 con el código `RN-TU-01`
- **Y** el original conserva todos sus datos y estado
- **Y** no se guarda un turno nuevo

#### Scenario: El destino está fuera del horario de atención

- **Dado** un turno original activo y un destino que no cabe en una sola franja de atención
- **Cuando** se solicita la reprogramación
- **Entonces** el sistema responde 422 con el código `RN-TU-02`
- **Y** no modifica ni reemplaza el turno original

#### Scenario: El destino se superpone con un bloqueo

- **Dado** un turno original activo y un destino que se superpone con un bloqueo
- **Cuando** se solicita la reprogramación
- **Entonces** el sistema responde 409 con el código `RN-TU-03`
- **Y** no modifica ni reemplaza el turno original

#### Scenario: El destino empieza en el pasado

- **Dado** un turno original activo y un destino cuyo inicio ya pasó
- **Cuando** se solicita la reprogramación
- **Entonces** el sistema responde 422 con el código `RN-TU-04`
- **Y** no modifica ni reemplaza el turno original

#### Scenario: La duración del destino es inválida

- **Dado** un turno original activo y una duración fuera del rango de 5 a 480 minutos o que no es múltiplo de 5
- **Cuando** se solicita la reprogramación
- **Entonces** el sistema responde 422 con el código `RN-TU-05`
- **Y** no modifica ni reemplaza el turno original

#### Scenario: El turno original no existe

- **Dado** un identificador que no corresponde a ningún turno
- **Cuando** se solicita la reprogramación
- **Entonces** el sistema responde 404
- **Y** no crea un turno nuevo (RN-TU-09)

### Requirement: Rechazar un turno original no reprogramable

El sistema MUST rechazar la reprogramación si el turno original ya empezó o no puede transicionarse conforme a RN-TU-08. (RN-TU-08, RN-TU-09)

#### Scenario: El turno original ya empezó

- **Dado** un turno original `RESERVADO` o `CONFIRMADO` cuyo inicio ya llegó
- **Cuando** se solicita la reprogramación
- **Entonces** el sistema responde 422 con el código `RN-TU-09`
- **Y** no modifica el original ni crea otro turno

#### Scenario: El turno original está en estado final

- **Dado** un turno original en estado `CANCELADO`, `ASISTIO` o `AUSENTE`
- **Cuando** se solicita la reprogramación
- **Entonces** el sistema responde 422 con el código `RN-TU-08`
- **Y** no modifica el original ni crea otro turno

### Requirement: Guardar la reprogramación sin intercalado

El caso de uso MUST calcular todos los datos necesarios antes de la primera escritura. Debe verificar conflictos y guardar el original cancelado y el turno nuevo sin ningún `await` entre la verificación de solapamiento y las escrituras. (RN-TU-09, RN-TU-10)

#### Scenario: Dos solicitudes de reprogramación concurrentes producen destinos incompatibles

- **Dado** dos solicitudes de reprogramación concurrentes cuyos destinos se superponen
- **Cuando** ambas se procesan en el mismo proceso Node
- **Entonces** como máximo una persiste
- **Y** el segundo pedido recibe 409 con el código `RN-TU-01`
- **Y** no queda una reprogramación parcialmente aplicada (RN-TU-10)
