# agenda-diaria Specification

## Purpose

Permitir que el odontólogo consulte los horarios de atención, los bloqueos y los turnos de una fecha en la zona horaria del consultorio.

## Requirements

### Requirement: Consultar la jornada del consultorio

La pantalla SHALL mostrar las franjas de atención, los bloqueos identificados por texto y estilo, y los turnos ordenados por inicio con paciente, prestación y estado. Las horas SHALL corresponder a `America/Argentina/Buenos_Aires` (RN-CF-01).

#### Scenario: Jornada con dos turnos

- **GIVEN** un día con franjas, un bloqueo y dos turnos recibidos en orden inverso
- **WHEN** el odontólogo abre la jornada
- **THEN** ve las franjas, el bloqueo y los turnos en el orden de sus horas locales, con paciente, prestación y estado

#### Scenario: Turnos consecutivos

- **GIVEN** un turno de 09:00 a 09:30 y otro de 09:30 a 10:00
- **WHEN** se prepara la vista
- **THEN** aparecen como dos filas consecutivas sin indicación de solapamiento (RN-TU-01)

#### Scenario: Día sin atención

- **GIVEN** un día con cero franjas de atención
- **WHEN** la consulta responde correctamente
- **THEN** se muestra «Sin atención» (RN-AG-01)

#### Scenario: Día de atención sin turnos

- **GIVEN** un día con franjas y cero turnos
- **WHEN** la consulta responde correctamente
- **THEN** se conservan las franjas y aparece «No hay turnos para este día»

### Requirement: Navegar entre fechas

La pantalla SHALL abrir inicialmente en el día actual del consultorio y ofrecer acciones para consultar el día anterior, el siguiente y hoy.

#### Scenario: Cambio de fecha

- **GIVEN** la pantalla en el último día de un mes
- **WHEN** se pulsa «Siguiente»
- **THEN** se consulta el primer día del mes siguiente y la vista refleja solo ese día

### Requirement: Informar fallos de carga

La pantalla SHALL presentar un mensaje accesible con el código RN cuando la API lo proporcione.

#### Scenario: Respuesta de error de negocio

- **GIVEN** una consulta que devuelve un error con código y mensaje
- **WHEN** falla la carga
- **THEN** el código y el mensaje aparecen en una región con `role="alert"`

### Requirement: Servir la interfaz desde el proceso local

El servidor SHALL devolver los recursos de la agenda con su tipo de contenido y SHALL limitar los archivos servidos a las rutas estáticas registradas.

#### Scenario: Carga de la pantalla

- **GIVEN** el servidor local iniciado
- **WHEN** se solicitan la página, la hoja de estilos y sus módulos
- **THEN** cada recurso responde con su tipo de contenido y los módulos contienen JavaScript ejecutable
