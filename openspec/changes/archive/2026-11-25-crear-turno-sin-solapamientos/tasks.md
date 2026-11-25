# Tasks

## 1. Proyecto base

- [x] 1.1 Crear `package.json` y `.env.example`. Verificar que Node 22.18.0 sea el mínimo, que los scripts ejecuten TypeScript sin flags y que los archivos carezcan de dependencias y secretos.
- [x] 1.2 Crear el arranque y router con `node:http`, lectura de JSON acotada y la ruta de salud. Probar que un cuerpo por encima del límite se rechaza sin llamar al caso de uso.
- [x] 1.3 C07-01 — Verificar el arranque local y la ruta de salud en HTTP (RN-DA-01/02).
- [x] 1.4 Crear el README inicial con requisitos, arranque y `node --test`. Verificar que las instrucciones de arranque y salud se puedan seguir desde un clon limpio, sin `npm install`.

## 2. Dominio, adaptadores y disponibilidad

- [x] 2.1 Definir los tipos de agenda, el reloj inyectable y los puertos de turnos, horarios, bloqueos, prestaciones y pacientes. Verificar que el dominio se pueda ejercer con un reloj fijo y repositorios de prueba sin levantar HTTP.
- [x] 2.2 Implementar intervalos semiabiertos y el helper de estados. Probar intervalos superpuestos y contiguos y cubrir las transiciones válidas y los estados finales de RN-TU-08 en `tests/agenda/`.
- [x] 2.3 Implementar los repositorios `Map` y la semilla ficticia. Verificar un consultorio, una franja de 08:00 a 16:00 por día hábil, «Consulta general» de 20 minutos, tres pacientes ficticios y un bloqueo de ejemplo.
- [x] 2.4 Implementar y documentar `GET /api/v1/disponibilidad?fecha=AAAA-MM-DD&prestacionId=...`. Generar horarios desde la apertura de cada franja en pasos de la duración configurada y filtrar por reloj, franja, bloqueos y turnos activos. Verificar que el ejemplo del README devuelve horarios sin guardar turnos.
- [x] 2.5 C07-23 — Verificar en HTTP los 24 horarios de 20 minutos en un día libre, desde 08:00 hasta 15:40, y que la agenda permanezca vacía (RN-TU-02/05).
- [x] 2.6 C07-24 — Verificar la exclusión de horarios ocupados, bloqueados y no futuros, y la inclusión de horarios contiguos o liberados (RN-TU-01/03/04).
- [x] 2.7 C07-25 — Verificar `422` por parámetros requeridos ausentes, fecha inválida y prestación inexistente o inactiva, con `RN-TU-07` para referencias inválidas.
- [x] 2.8 C07-26 — Verificar `200` y lista vacía en un día sin atención o sin horarios libres (RN-TU-01/02).

## 3. Alta de turnos

- [x] 3.1 Implementar el caso de uso en el orden de C-07 y conectar el POST con la validación de entrada y el traductor de errores. Reutilizar las reglas de disponibilidad y mantener chequeo de solapamiento y guardado en un tramo síncrono. Probar la precedencia de reglas y verificar `{ codigo, mensaje, detalle }` en HTTP.
- [x] 3.2 C07-02 — Verificar `201`, estado `RESERVADO` y fin a las 08:20 para «Consulta general» a las 08:00 (RN-TU-05/06).
- [x] 3.3 C07-03 — Verificar que una duración enviada por el paciente produce `422 RN-TU-05` sin guardar el turno.
- [x] 3.4 C07-04 — Verificar que una configuración de prueba de 30 minutos modifica tanto los horarios ofrecidos como el fin de la reserva (RN-TU-05/06).
- [x] 3.5 C07-18 — Verificar en HTTP que un campo `fin` enviado por el cliente devuelve `422` y `RN-TU-06` (RN-TU-06).
- [x] 3.6 C07-05 — Rechazar un paciente inexistente en HTTP (RN-TU-07).
- [x] 3.7 C07-06 — Rechazar una prestación inactiva en HTTP (RN-TU-07).
- [x] 3.8 C07-07 — Verificar con reloj fijo el inicio pasado y el inicio igual a ahora (RN-TU-04).
- [x] 3.9 C07-08 — Rechazar un turno que cruza el corte entre franjas en HTTP (RN-TU-02).
- [x] 3.10 C07-09 — Rechazar un turno en un día sin franjas en HTTP (RN-TU-02).
- [x] 3.11 C07-10 — Verificar el conflicto con un bloqueo en HTTP y la indicación de elegir otro horario (RN-TU-03).
- [x] 3.12 C07-11 — Verificar en HTTP el contacto con el extremo de un bloqueo (RN-TU-03).
- [x] 3.13 C07-12 — Verificar en HTTP el conflicto con un turno reservado y con uno confirmado (RN-TU-01).
- [x] 3.14 C07-13 — Verificar en HTTP que dos turnos contiguos quedan guardados (RN-TU-01).
- [x] 3.15 C07-14 — Verificar con turnos de prueba que cada estado final deja el horario disponible (RN-TU-01).
- [x] 3.16 Documentar y ejecutar el flujo de consulta y confirmación con datos ficticios. Mostrar el turno contiguo y el conflicto que indica elegir otro horario.
- [x] 3.17 C07-20 — Verificar que la consulta ofrece 15:40 como último horario y que puede reservarse con fin a las 16:00 (RN-TU-02/06).
- [x] 3.18 C07-21 — Verificar `422 RN-TU-02` y ausencia de una reserva a las 15:50 que terminaría a las 16:10.
- [x] 3.19 C07-22 — Verificar el rechazo de las 08:10 con `422` y el mensaje para elegir un horario ofrecido.

## 4. Agenda diaria

- [x] 4.1 Implementar el GET por fecha local con paciente, prestación y estado. Agregar un ejemplo al README y verificar que use `?fecha=AAAA-MM-DD`.
- [x] 4.2 C07-16 — Verificar en HTTP fecha local, orden y datos del listado usando offsets distintos (RN-CF-01).
- [x] 4.3 C07-17 — Verificar en HTTP el resultado vacío de una fecha válida (RN-CF-01).
- [x] 4.4 C07-19 — Verificar en HTTP que una fecha ausente, mal formada o imposible devuelve `422`.

## 5. Verificación integrada

- [x] 5.1 C07-15 — Consultar el mismo horario libre para dos pacientes ficticios, enviar sus POST en paralelo y comprobar un `201`, un `409 RN-TU-01` con indicación de elegir otro horario y un único turno en el GET diario para el paciente que recibió `201` (RN-TU-10).
- [x] 5.2 Ejecutar `node --test` en Windows y Linux y verificar el arranque y los ejemplos del README en un clon limpio. Confirmar que el entorno de prueba y la evidencia usen datos ficticios.

Los identificadores `C07-NN` corresponden al [spec de agenda](specs/agenda-turnos/spec.md). Usar al menos un test por escenario y poner el código RN en el nombre cuando corresponda.
