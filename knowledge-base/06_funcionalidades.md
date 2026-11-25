# Funcionalidades

Las historias de usuario están agrupadas por épica. El actor de todas es el odontólogo independiente. La prioridad **MVP** sigue la sección D.3 del informe de Discovery.

## Épica 1: Acceso

### US-001: Iniciar y cerrar sesión (MVP)
**Como** odontólogo **quiero** iniciar sesión con email y contraseña **para** que nadie más vea los datos de mis pacientes.

**Criterios de aceptación**:
- [ ] Con credenciales válidas obtengo una sesión o token, y con credenciales inválidas recibo 401 sin que se indique cuál de los dos campos falló.
- [ ] Sin sesión, toda ruta de la API (excepto login y health) responde 401.
- [ ] La contraseña se guarda con `crypto.scrypt` y una sal aleatoria.

**Reglas relacionadas**: RN-DA-02

## Épica 2: Configuración del consultorio

### US-010: Configurar datos y anticipación de cancelación (MVP)
**Como** odontólogo **quiero** cargar nombre, dirección, teléfono y la anticipación mínima de cancelación **para** que los recordatorios y las cancelaciones usen mis datos.

**Criterios de aceptación**:
- [ ] La anticipación vale 24 h por defecto y acepta valores de 0 a 168. Fuera de ese rango responde 422.

**Reglas relacionadas**: RN-CF-01, RN-CF-02

### US-011: Definir horario de atención (MVP)
**Como** odontólogo **quiero** definir franjas por día de la semana **para** que solo se puedan dar turnos cuando atiendo.

**Criterios de aceptación**:
- [ ] Puedo cargar varias franjas por día (por ejemplo 9-13 y 15-19).
- [ ] Si dos franjas del mismo día se superponen, o una tiene inicio mayor o igual a fin, responde 422.

**Reglas relacionadas**: RN-AG-01, RN-AG-04

### US-012: Gestionar prestaciones (MVP)
**Como** odontólogo **quiero** un catálogo de prestaciones con duración **para** no calcular a mano cuánto dura cada turno.

**Criterios de aceptación**:
- [ ] Una duración que no esté entre 5 y 480 minutos o no sea múltiplo de 5 responde 422.
- [ ] Un nombre duplicado responde 422.
- [ ] Puedo desactivar una prestación. Ya no aparece al crear turnos, pero se sigue viendo en los turnos que la usaron.

**Reglas relacionadas**: RN-PR-01, RN-PR-02

### US-013: Bloquear la agenda (MVP)
**Como** odontólogo **quiero** bloquear períodos (feriados, vacaciones) **para** que no se den turnos en ellos.

**Criterios de aceptación**:
- [ ] Si el bloqueo se superpone con turnos activos, responde 409 con la lista de esos turnos.
- [ ] Puedo eliminar un bloqueo.

**Reglas relacionadas**: RN-AG-02, RN-AG-03

## Épica 3: Pacientes

### US-020: Registrar y editar pacientes (MVP)
**Como** odontólogo **quiero** registrar pacientes con datos mínimos **para** asignarles turnos y enviarles recordatorios.

**Criterios de aceptación**:
- [ ] DNI y teléfono son obligatorios. Un DNI duplicado responde 422.
- [ ] El teléfono se normaliza al formato que usa `wa.me`.
- [ ] Puedo buscar por apellido o DNI.

**Reglas relacionadas**: RN-PA-01, RN-PA-02, RN-DA-01

## Épica 4: Agenda y turnos (núcleo)

### US-030: Crear un turno sin solapamientos (MVP)
**Recomendado como primer change de OPSX.**

**Como** odontólogo **quiero** crear un turno para un paciente y una prestación **para** reservar el horario sin riesgo de doble reserva.

**Criterios de aceptación**:
- [ ] **Caso feliz:** un turno libre, dentro de una franja y sin bloqueos, se crea en estado `RESERVADO` con `fin` calculado.
- [ ] **Error de negocio:** si se superpone con un turno activo, responde 409 `RN-TU-01`.
- [ ] **Borde:** un turno que empieza exactamente cuando termina otro se crea sin error.
- [ ] Si queda fuera de la franja o cruza el corte entre franjas, responde 422 `RN-TU-02`.
- [ ] Si se superpone con un bloqueo, responde 409 `RN-TU-03`.
- [ ] Si el inicio está en el pasado, responde 422 `RN-TU-04`.
- [ ] Si la prestación está inactiva o el paciente no existe, responde 422 `RN-TU-07`.
- [ ] Si llegan dos creaciones simultáneas que se solapan, solo una se guarda (`RN-TU-10`).

**Reglas relacionadas**: RN-TU-01 a RN-TU-07, RN-TU-10

### US-031: Ver la agenda diaria y semanal (MVP)
**Como** odontólogo **quiero** ver mis turnos por día y por semana **para** organizar mi jornada.

**Criterios de aceptación**:
- [ ] `GET /turnos?desde=&hasta=` devuelve los turnos del rango ordenados por inicio, con paciente, prestación y estado.
- [ ] El frontend muestra la vista diaria y la semanal con las franjas de atención y los bloqueos.

### US-032: Reprogramar un turno (MVP)
**Como** odontólogo **quiero** mover un turno a otro horario **para** acomodar cambios del paciente.

**Criterios de aceptación**:
- [ ] El turno nuevo se valida con las mismas reglas que en US-030, sin contar el turno original.
- [ ] El turno original queda cancelado en término y el nuevo apunta a él con `reprogramado_desde_id`.

**Reglas relacionadas**: RN-TU-09, RN-TU-08

### US-033: Cancelar un turno y liberar el horario (MVP)
**Como** odontólogo **quiero** cancelar un turno **para** liberar el horario y saber si la cancelación fue tardía.

**Criterios de aceptación**:
- [ ] Con anticipación mayor o igual a la configurada queda `EN_TERMINO`; con menos, `TARDIA`.
- [ ] El horario queda libre de inmediato.
- [ ] Cancelar un turno que ya empezó o que está en estado final responde 422.

**Reglas relacionadas**: RN-CA-01 a RN-CA-04

## Épica 5: Asistencia

### US-040: Registrar asistencia (MVP)
**Como** odontólogo **quiero** marcar si el paciente asistió o faltó **para** llevar registro de las ausencias.

**Criterios de aceptación**:
- [ ] Solo se permite si ya pasó el inicio del turno y el turno está activo.

**Reglas relacionadas**: RN-AS-01, RN-TU-08

## Épica 6: Recordatorios por WhatsApp

### US-050: Generar recordatorio `wa.me` (MVP, diferenciador)
**Como** odontólogo **quiero** abrir con un clic un WhatsApp con el recordatorio ya escrito **para** avisar al paciente sin pagar por mensaje.

**Criterios de aceptación**:
- [ ] El enlace usa el teléfono normalizado y un texto URL-encoded con nombre, fecha, hora y dirección.
- [ ] El texto **no** contiene la prestación ni ningún dato clínico.
- [ ] Solo se genera para turnos activos que todavía no empezaron.
- [ ] Puedo marcar el recordatorio como enviado.

**Reglas relacionadas**: RN-RE-01 a RN-RE-04, RN-PA-02

## Épica 7: Frontend web (MVP mínimo)

### US-060: Interfaz web mínima
**Como** odontólogo **quiero** una interfaz web **para** usar todas las funciones anteriores sin herramientas técnicas.

**Criterios de aceptación**:
- [ ] Pantallas: login, agenda (día y semana), formulario de turno, pacientes, configuración (consultorio, horarios, prestaciones, bloqueos).
- [ ] Los errores de negocio se muestran con un mensaje claro que menciona la regla.

## Backlog: etapas posteriores (fuera del MVP)

| Funcionalidad | Origen |
|---|---|
| Turnero online del paciente | Informe D.3 |
| WhatsApp Business API automático | Informe D.3; riesgo de costo |
| Señas con Mercado Pago | Informe D.3 |
| Facturación ARCA | Informe C.3 |
| Obras sociales y liquidaciones | Informe C.3 |
| Odontograma, periodontograma e historia clínica | Informe C.1 (estándar de mercado) |
| Varios profesionales, sillones o boxes | Decisión del Discovery (sin sillón en el MVP) |
| Lista de espera, sobreturnos | Informe A.2 |
| Reportes de ausentismo | Informe D.3 |
