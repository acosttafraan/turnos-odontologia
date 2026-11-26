# agenda-turnos Specification

## Purpose

Permitir que el paciente consulte horarios por prestación y reserve un turno según la configuración del odontólogo. El odontólogo puede consultar la agenda diaria.

## Requirements

### Requirement: Servicio local

El servicio SHALL escuchar solo en `127.0.0.1:3000` en su arranque normal y trabajar con datos ficticios (RN-DA-01/02).

#### Scenario: C07-01 Salud del servidor local

- **GIVEN** (Dado) un servidor iniciado siguiendo el README
- **WHEN** (Cuando) se consulta `GET /api/v1/health` desde el equipo local
- **THEN** (Entonces) responde `200` y la escucha queda limitada a `127.0.0.1`
- **Prueba** [Tarea 1.3](../../changes/archive/2026-11-25-crear-turno-sin-solapamientos/tasks.md#1-proyecto-base)

### Requirement: Alta y cálculo del fin

`POST /api/v1/turnos` SHALL recibir `pacienteId`, `prestacionId` e `inicio` en ISO 8601 con offset. SHALL usar la duración configurada por el odontólogo para la prestación y calcular `fin = inicio + duración`. SHALL rechazar `duracionMinutos` con `422 RN-TU-05` y `fin` con `422 RN-TU-06` si los envía el cliente.

#### Scenario: C07-02 Reserva con duración configurada

- **GIVEN** (Dado) un paciente ficticio, «Consulta general» configurada con 20 minutos y disponibilidad a las 08:00 de un día hábil futuro
- **WHEN** (Cuando) se envía `POST /api/v1/turnos` para las 08:00 con esa prestación
- **THEN** (Entonces) responde `201`, persiste un turno `RESERVADO` de 20 minutos y devuelve `fin` a las 08:20
- **Prueba** [Tarea 3.2](../../changes/archive/2026-11-25-crear-turno-sin-solapamientos/tasks.md#3-alta-de-turnos)

#### Scenario: C07-03 Duración enviada por el paciente

- **GIVEN** (Dado) «Consulta general» de 20 minutos y una solicitud de reserva válida
- **WHEN** (Cuando) el paciente agrega `duracionMinutos: 30` al POST
- **THEN** (Entonces) responde `422` con `RN-TU-05` y el turno no se guarda
- **Prueba** [Tarea 3.3](../../changes/archive/2026-11-25-crear-turno-sin-solapamientos/tasks.md#3-alta-de-turnos)

#### Scenario: C07-04 Prestación con otra duración configurada

- **GIVEN** (Dado) una configuración de prueba con franja de 08:00 a 16:00 y una prestación que el odontólogo configuró con 30 minutos
- **WHEN** (Cuando) el paciente consulta la disponibilidad y confirma las 08:30
- **THEN** (Entonces) la consulta ofrece intervalos de 30 minutos y el POST responde `201` con `fin` a las 09:00
- **Prueba** [Tarea 3.4](../../changes/archive/2026-11-25-crear-turno-sin-solapamientos/tasks.md#3-alta-de-turnos)

#### Scenario: C07-18 Fin enviado por el cliente

- **GIVEN** (Dado) una solicitud de alta válida con un campo adicional `fin`
- **WHEN** (Cuando) se envía el POST
- **THEN** (Entonces) responde `422` con `RN-TU-06` y el turno no se guarda
- **Prueba** [Tarea 3.5](../../changes/archive/2026-11-25-crear-turno-sin-solapamientos/tasks.md#3-alta-de-turnos)

### Requirement: Referencias válidas

El sistema SHALL exigir un paciente existente y una prestación activa. Si alguna referencia falla, SHALL responder `422` con `RN-TU-07`.

#### Scenario: C07-05 Paciente inexistente

- **GIVEN** (Dado) una prestación activa y un identificador de paciente inexistente
- **WHEN** (Cuando) se solicita el alta
- **THEN** (Entonces) responde `422` con `RN-TU-07` y el turno no se guarda
- **Prueba** [Tarea 3.6](../../changes/archive/2026-11-25-crear-turno-sin-solapamientos/tasks.md#3-alta-de-turnos)

#### Scenario: C07-06 Prestación inactiva

- **GIVEN** (Dado) un paciente existente y una prestación inactiva
- **WHEN** (Cuando) se solicita el alta
- **THEN** (Entonces) responde `422` con `RN-TU-07` y el turno no se guarda
- **Prueba** [Tarea 3.7](../../changes/archive/2026-11-25-crear-turno-sin-solapamientos/tasks.md#3-alta-de-turnos)

### Requirement: Inicio posterior al momento actual

El sistema SHALL exigir que `inicio` sea estrictamente posterior al momento actual (RN-TU-04).

#### Scenario: C07-07 Inicio pasado o igual al momento actual

- **GIVEN** (Dado) referencias válidas y un reloj fijo
- **WHEN** (Cuando) se solicita un inicio anterior o igual a la hora del reloj
- **THEN** (Entonces) responde `422` con `RN-TU-04` y el turno no se guarda
- **Prueba** [Tarea 3.8](../../changes/archive/2026-11-25-crear-turno-sin-solapamientos/tasks.md#3-alta-de-turnos)

### Requirement: Una sola franja de atención

El sistema SHALL exigir que el intervalo completo quepa en una sola franja de atención del día de Buenos Aires (RN-TU-02, RN-CF-01). Para confirmar, el inicio SHALL coincidir con uno de los horarios generados para la prestación a partir de la apertura de la franja.

#### Scenario: C07-08 Turno que cruza el corte

- **GIVEN** (Dado) una configuración de prueba con franjas de 08:00 a 12:10 y de 13:00 a 16:00 y una prestación de 20 minutos
- **WHEN** (Cuando) se pide un turno que empieza a las 12:00 y terminaría a las 12:20
- **THEN** (Entonces) responde `422` con `RN-TU-02` y el turno no se guarda
- **Prueba** [Tarea 3.9](../../changes/archive/2026-11-25-crear-turno-sin-solapamientos/tasks.md#3-alta-de-turnos)

#### Scenario: C07-09 Día sin atención

- **GIVEN** (Dado) un día futuro sin franjas
- **WHEN** (Cuando) se solicita un turno para ese día
- **THEN** (Entonces) responde `422` con `RN-TU-02` y el turno no se guarda
- **Prueba** [Tarea 3.10](../../changes/archive/2026-11-25-crear-turno-sin-solapamientos/tasks.md#3-alta-de-turnos)

#### Scenario: C07-20 Último horario permitido a las 15:40

- **GIVEN** (Dado) la franja de 08:00 a 16:00 y «Consulta general» de 20 minutos en un día futuro con las 15:40 libres
- **WHEN** (Cuando) el paciente consulta la disponibilidad y confirma las 15:40
- **THEN** (Entonces) las 15:40 aparecen como último horario y el POST responde `201` con `fin` a las 16:00
- **Prueba** [Tarea 3.17](../../changes/archive/2026-11-25-crear-turno-sin-solapamientos/tasks.md#3-alta-de-turnos)

#### Scenario: C07-21 Turno que termina después de las 16:00

- **GIVEN** (Dado) la franja de 08:00 a 16:00 y «Consulta general» de 20 minutos
- **WHEN** (Cuando) se intenta reservar a las 15:50 en un día hábil futuro
- **THEN** (Entonces) el turno terminaría a las 16:10 y el POST responde `422` con `RN-TU-02` sin guardar la reserva
- **Prueba** [Tarea 3.18](../../changes/archive/2026-11-25-crear-turno-sin-solapamientos/tasks.md#3-alta-de-turnos)

#### Scenario: C07-22 Inicio ajeno a los horarios ofrecidos

- **GIVEN** (Dado) la franja de 08:00 a 16:00 y «Consulta general» de 20 minutos sin conflictos
- **WHEN** (Cuando) se intenta reservar a las 08:10 en un día hábil futuro
- **THEN** (Entonces) responde `422` con un mensaje para elegir un horario ofrecido y el turno no se guarda
- **Prueba** [Tarea 3.19](../../changes/archive/2026-11-25-crear-turno-sin-solapamientos/tasks.md#3-alta-de-turnos)

### Requirement: Disponibilidad frente a bloqueos

El sistema SHALL rechazar un turno que se superponga con un bloqueo, indicar que se elija otro horario y tratar ambos como intervalos semiabiertos `[inicio, fin)` (RN-TU-03).

#### Scenario: C07-10 Turno superpuesto a un bloqueo

- **GIVEN** (Dado) un bloqueo de 10:00 a 11:00 dentro de una franja futura y una prestación de 20 minutos
- **WHEN** (Cuando) se solicita un turno a las 10:40
- **THEN** (Entonces) responde `409` con `RN-TU-03`, indica que se elija otro horario y el turno no se guarda
- **Prueba** [Tarea 3.11](../../changes/archive/2026-11-25-crear-turno-sin-solapamientos/tasks.md#3-alta-de-turnos)

#### Scenario: C07-11 Turno contiguo a un bloqueo

- **GIVEN** (Dado) un bloqueo que termina a las 11:00 y un horario libre dentro de una franja futura
- **WHEN** (Cuando) se solicita un turno que empieza a las 11:00
- **THEN** (Entonces) responde `201` y guarda el turno
- **Prueba** [Tarea 3.12](../../changes/archive/2026-11-25-crear-turno-sin-solapamientos/tasks.md#3-alta-de-turnos)

### Requirement: Solapamiento en la agenda única

El sistema SHALL impedir solapamientos con turnos `RESERVADO` o `CONFIRMADO` y permitir intervalos contiguos `[inicio, fin)`. Los estados `CANCELADO`, `ASISTIO` y `AUSENTE` MUST dejar el horario disponible (RN-TU-01).

#### Scenario: C07-12 Turno superpuesto a un turno activo

- **GIVEN** (Dado) un turno activo de 09:00 a 09:30 y una prestación de 20 minutos
- **WHEN** (Cuando) se solicita otro de 09:20 a 09:40
- **THEN** (Entonces) responde `409` con `RN-TU-01`, indica que se elija otro horario y el turno nuevo no se guarda
- **Prueba** [Tarea 3.13](../../changes/archive/2026-11-25-crear-turno-sin-solapamientos/tasks.md#3-alta-de-turnos)

#### Scenario: C07-13 Turnos contiguos permitidos

- **GIVEN** (Dado) un turno activo de 09:00 a 09:20 y disponibilidad a continuación
- **WHEN** (Cuando) se solicita otro de 09:20 a 09:40
- **THEN** (Entonces) responde `201` y ambos turnos quedan guardados
- **Prueba** [Tarea 3.14](../../changes/archive/2026-11-25-crear-turno-sin-solapamientos/tasks.md#3-alta-de-turnos)

#### Scenario: C07-14 Estados finales dejan el horario disponible

- **GIVEN** (Dado) un turno del horario solicitado en estado `CANCELADO`, `ASISTIO` o `AUSENTE` y el resto de las condiciones de alta satisfechas
- **WHEN** (Cuando) se solicita el turno para ese horario
- **THEN** (Entonces) responde `201` y guarda el turno nuevo
- **Prueba** [Tarea 3.15](../../changes/archive/2026-11-25-crear-turno-sin-solapamientos/tasks.md#3-alta-de-turnos)

### Requirement: Alta concurrente

Al confirmar, el sistema SHALL volver a comprobar la disponibilidad y guardar como máximo una de dos reservas simultáneas incompatibles (RN-TU-10). Ante un turno activo en conflicto, SHALL responder `409 RN-TU-01` e indicar que se elija otro horario.

#### Scenario: C07-15 Dos pacientes reservan el mismo horario

- **GIVEN** (Dado) dos pacientes ficticios que consultan y ven libre el mismo horario de «Consulta general»
- **WHEN** (Cuando) envían sendos `POST /api/v1/turnos` para ese horario en paralelo al mismo servidor
- **THEN** (Entonces) un POST responde `201` y guarda un turno `RESERVADO`. El otro responde `409 RN-TU-01` e indica elegir otro horario. La agenda diaria contiene una sola reserva, correspondiente al paciente que recibió `201`
- **Prueba** [Tarea 5.1](../../changes/archive/2026-11-25-crear-turno-sin-solapamientos/tasks.md#5-verificación-integrada)

### Requirement: Consulta de disponibilidad por prestación

`GET /api/v1/disponibilidad` SHALL requerir `fecha=AAAA-MM-DD` en Buenos Aires y `prestacionId` de una prestación activa. SHALL devolver intervalos `inicio` y `fin` con offset, ordenados por inicio. Los inicios SHALL avanzar desde cada apertura en pasos de la duración configurada. Solo SHALL incluir intervalos futuros que quepan en su franja y estén libres de bloqueos y turnos activos. El GET no guarda reservas.

#### Scenario: C07-23 Horarios libres en pasos de 20 minutos

- **GIVEN** (Dado) un día hábil futuro sin turnos ni bloqueos, con franja de 08:00 a 16:00 y «Consulta general» de 20 minutos
- **WHEN** (Cuando) se consulta la disponibilidad por esa fecha y prestación
- **THEN** (Entonces) devuelve `200` con 24 intervalos en pasos de 20 minutos, desde 08:00–08:20 hasta 15:40–16:00, y la agenda sigue vacía
- **Prueba** [Tarea 2.5](../../changes/archive/2026-11-25-crear-turno-sin-solapamientos/tasks.md#2-dominio-adaptadores-y-disponibilidad)

#### Scenario: C07-24 Horarios ocupados, bloqueados y pasados

- **GIVEN** (Dado) el reloj a las 08:00 del día consultado, un turno activo de 10:00 a 10:20, un bloqueo de 11:00 a 11:20 y un turno cancelado de 12:00 a 12:20
- **WHEN** (Cuando) se consulta «Consulta general» para ese día
- **THEN** (Entonces) omite 08:00, 10:00 y 11:00, e incluye 08:20, los horarios contiguos que estén libres y 12:00
- **Prueba** [Tarea 2.6](../../changes/archive/2026-11-25-crear-turno-sin-solapamientos/tasks.md#2-dominio-adaptadores-y-disponibilidad)

#### Scenario: C07-25 Consulta de disponibilidad inválida

- **GIVEN** (Dado) el endpoint de disponibilidad
- **WHEN** (Cuando) falta un parámetro requerido, `fecha` es inválida o la prestación no existe o está inactiva
- **THEN** (Entonces) responde `422`. Para una prestación inexistente o inactiva devuelve `RN-TU-07`
- **Prueba** [Tarea 2.7](../../changes/archive/2026-11-25-crear-turno-sin-solapamientos/tasks.md#2-dominio-adaptadores-y-disponibilidad)

#### Scenario: C07-26 Día sin horarios disponibles

- **GIVEN** (Dado) una prestación activa y un día válido sin franjas de atención o con todos sus horarios ocupados
- **WHEN** (Cuando) se consulta la disponibilidad para ese día
- **THEN** (Entonces) responde `200` con una lista vacía
- **Prueba** [Tarea 2.8](../../changes/archive/2026-11-25-crear-turno-sin-solapamientos/tasks.md#2-dominio-adaptadores-y-disponibilidad)

### Requirement: Consulta de la agenda diaria

`GET /api/v1/turnos?fecha=AAAA-MM-DD` SHALL devolver únicamente los turnos que empiezan ese día en `America/Argentina/Buenos_Aires`, ordenados por instante de inicio y con paciente, prestación y estado (RN-CF-01). SHALL responder `422` si la fecha falta o es inválida.

#### Scenario: C07-16 Listado ordenado por inicio y filtrado por fecha

- **GIVEN** (Dado) turnos guardados fuera de orden, uno de otro día local y uno del día consultado representado con un offset distinto
- **WHEN** (Cuando) se consulta la fecha local de Buenos Aires
- **THEN** (Entonces) responde `200` con los turnos de ese día en orden de inicio, con paciente, prestación y estado
- **Prueba** [Tarea 4.2](../../changes/archive/2026-11-25-crear-turno-sin-solapamientos/tasks.md#4-agenda-diaria)

#### Scenario: C07-17 Día sin turnos

- **GIVEN** (Dado) una fecha válida sin turnos
- **WHEN** (Cuando) se consulta esa fecha
- **THEN** (Entonces) responde `200` con una lista vacía
- **Prueba** [Tarea 4.3](../../changes/archive/2026-11-25-crear-turno-sin-solapamientos/tasks.md#4-agenda-diaria)

#### Scenario: C07-19 Fecha ausente o inválida

- **GIVEN** (Dado) el endpoint de consulta diaria disponible
- **WHEN** (Cuando) se consulta sin `fecha`, con otro formato o con una fecha imposible como `2026-02-30`
- **THEN** (Entonces) responde `422`
- **Prueba** [Tarea 4.4](../../changes/archive/2026-11-25-crear-turno-sin-solapamientos/tasks.md#4-agenda-diaria)

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
