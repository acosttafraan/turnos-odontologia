# Reglas de Negocio

Cada regla tiene un código `RN-{DOMINIO}-{NN}`, que sirve para rastrearla en specs, tests y mensajes de error. La fuente es la sección 7 de [discovery.md](../docs/discovery/discovery.md). Si una regla dice que fue "definida en la KB", la propuso esta KB y conviene revisarla.

## Dominio: Configuración (RN-CF)

- **RN-CF-01:** Todas las fechas y horas se interpretan en la zona `America/Argentina/Buenos_Aires`. Internamente se guardan como cadenas ISO 8601 con offset y se comparan en milisegundos UTC.
- **RN-CF-02:** La anticipación mínima de cancelación vale 24 h por defecto y el odontólogo puede configurarla entre 0 y 168 h.

## Dominio: Horario y bloqueos (RN-AG)

- **RN-AG-01:** El horario de atención se define con franjas por día de la semana. En cada franja la hora de inicio es menor que la de fin, y dos franjas del mismo día no se superponen. Un día sin franjas es un día sin atención.
- **RN-AG-02:** Un bloqueo tiene inicio menor que fin y marca un período en el que no se pueden dar turnos (feriado, vacaciones, ausencia).
- **RN-AG-03:** Si un bloqueo nuevo se superpone con turnos activos (`RESERVADO` o `CONFIRMADO`), se rechaza y la respuesta lista los turnos en conflicto. Esos turnos se resuelven antes de crear el bloqueo. *(Confirmada por el usuario el 2026-11-24; ver DD-10.)*
- **RN-AG-04:** Cambiar el horario de atención no modifica los turnos ya creados. *(Definida en la KB.)*

## Dominio: Prestaciones (RN-PR)

- **RN-PR-01:** Cada prestación tiene una duración por defecto entre 5 y 480 minutos, múltiplo de 5. El nombre es único en el consultorio.
- **RN-PR-02:** Una prestación con turnos no se borra; se desactiva. Una prestación inactiva no se puede usar en turnos nuevos.

## Dominio: Pacientes (RN-PA)

- **RN-PA-01:** El DNI es obligatorio y único en el consultorio.
- **RN-PA-02:** El teléfono es obligatorio y se normaliza al formato internacional sin `+`. Para un celular argentino es `549` + código de área sin 0 + número sin 15. Se necesita así para armar el enlace `wa.me`.

## Dominio: Turnos (RN-TU), el núcleo del MVP

- **RN-TU-01, sin solapamientos del profesional:** dos turnos activos no pueden superponerse. Los turnos son intervalos semiabiertos `[inicio, fin)`. Hay conflicto si `nuevo.inicio < existente.fin` **y** `existente.inicio < nuevo.fin`. **Un turno que empieza exactamente cuando termina otro es válido.** Los turnos `CANCELADO`, `ASISTIO` y `AUSENTE` no bloquean horario.
- **RN-TU-02, dentro del horario de atención:** el turno completo `[inicio, fin)` debe caer dentro de **una sola** franja de atención del día. No puede cruzar el corte entre franjas, por ejemplo de 13:00 a 15:00.
- **RN-TU-03, fuera de bloqueos:** el turno no puede superponerse con ningún bloqueo. Se usa la misma fórmula de intervalos que en RN-TU-01.
- **RN-TU-04, no en el pasado:** el inicio del turno debe ser posterior al momento actual.
- **RN-TU-05, duración:** en la reserva del paciente, la duración viene de la prestación y el servidor calcula el fin (RN-TU-06). Al reprogramar, se puede indicar `duracionMinutos` respetando el rango y el múltiplo de RN-PR-01. Si se omite, se usa la duración de la prestación.
- **RN-TU-06, fin calculado:** `fin = inicio + duración`. El cliente nunca envía `fin`.
- **RN-TU-07, referencias válidas:** el paciente debe existir y la prestación debe estar activa.
- **RN-TU-08, transiciones de estado:**
  - `RESERVADO → CONFIRMADO | CANCELADO | ASISTIO | AUSENTE`
  - `CONFIRMADO → CANCELADO | ASISTIO | AUSENTE`
  - `CANCELADO`, `ASISTIO` y `AUSENTE` son estados finales.
- **RN-TU-09, reprogramar:** se valida con las mismas reglas RN-TU-01 a RN-TU-05 que un turno nuevo, **excluyendo al propio turno** del chequeo de solapamiento. Para conservar el historial, el turno original queda `CANCELADO` (en término) y se crea un turno nuevo con `reprogramado_desde_id`. Reprogramar **nunca** cuenta como cancelación tardía, aunque se haga con menos anticipación que la mínima. *(Confirmada por el usuario el 2026-11-24; ver DD-10.)*
- **RN-TU-10, concurrencia:** si llegan dos pedidos simultáneos que se solapan, solo uno se persiste. El caso de uso lo garantiza en el proceso Node: verifica el solapamiento y guarda sin ningún `await` en el medio, así que el segundo pedido ve el turno del primero y recibe 409 `RN-TU-01`. Si en el futuro hay varios procesos o una base de datos externa, esta regla necesita un bloqueo o una restricción en la base (ver PA-14).

## Dominio: Cancelación (RN-CA)

- **RN-CA-01:** Si se cancela con una anticipación **mayor o igual** a la mínima configurada, la cancelación es `EN_TERMINO`. Si la anticipación es menor, es `TARDIA`. Cancelar exactamente con 24 h de anticipación (con la configuración por defecto) es en término.
- **RN-CA-02:** Un turno cancelado libera su horario de inmediato para otro turno (ver RN-TU-01).
- **RN-CA-03:** Solo se pueden cancelar turnos `RESERVADO` o `CONFIRMADO` que todavía no empezaron.
- **RN-CA-04:** Una cancelación tardía **no** cuenta como ausencia. Se registra como `CANCELADO` con `tipo_cancelacion = TARDIA` y nunca se convierte en `AUSENTE`. *(Confirmada por el usuario el 2026-11-24; ver DD-10.)*

## Dominio: Asistencia (RN-AS)

- **RN-AS-01:** La asistencia (`ASISTIO` o `AUSENTE`) solo se registra cuando ya pasó el inicio del turno, y solo sobre turnos `RESERVADO` o `CONFIRMADO`.

## Dominio: Recordatorios (RN-RE)

- **RN-RE-01:** El recordatorio es un enlace `https://wa.me/<telefono>?text=<mensaje-url-encoded>`. El sistema **no envía** mensajes: el odontólogo abre el enlace y lo envía.
- **RN-RE-02:** El mensaje incluye **solo** el nombre del paciente, la fecha, la hora y la dirección del consultorio. **No incluye la prestación ni ningún dato clínico.**
- **RN-RE-03:** Solo se genera recordatorio para turnos activos que todavía no empezaron.
- **RN-RE-04:** El odontólogo puede marcar el recordatorio como enviado. El sistema no puede verificar la entrega.

## Dominio: Datos personales y privacidad (RN-DA)

- **RN-DA-01:** Ningún ejemplo, seed, test, captura ni commit contiene datos reales de pacientes.
- **RN-DA-02:** Todos los datos de pacientes se acceden solo con autenticación. En producción, solo por HTTPS. *Suspendida temporalmente en desarrollo (DD-15): API solo en `127.0.0.1` y con datos ficticios hasta que exista `acceso-autenticacion`.*
- **RN-DA-03:** Los logs no registran DNI, teléfono ni contenido de mensajes.
- **RN-DA-04:** El diseño considera la Ley 25.326 (datos personales) y la Ley 26.529 (derechos del paciente). Su cumplimiento formal está fuera del alcance del TP (ver PA-08).

## Excepciones globales

- Toda violación de una regla responde con su código: 409 para conflictos de agenda (RN-TU-01, RN-TU-03, RN-TU-10, RN-AG-03) y 422 para las demás validaciones.
