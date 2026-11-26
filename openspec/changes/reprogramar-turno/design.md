# Diseño: reprogramar-turno

## Contexto

C-11 depende de C-07. El roadmap establece que la reprogramación agrega un caso de uso y una ruta, reutiliza `transicionarEstado` y no depende del caso de uso de cancelación de C-10.

El modelo `Turno` contiene `duracionMinutos`, `estado`, `tipoCancelacion`, `reprogramadoDesdeId`, `creadoEn` y `actualizadoEn`. El estado inicial del flujo de creación en F-02 es `RESERVADO`. La persistencia del MVP es en memoria (DD-14).

## Flujo propuesto

1. La API valida el cuerpo `{ inicio, duracionMinutos? }`. El caso de uso busca el turno por id y la API responde 404 si no existe.
2. El caso de uso comprueba que el turno original se pueda reprogramar según su estado y momento de inicio.
3. Calcula el turno nuevo antes de la primera escritura. Si se envía `duracionMinutos`, valida su valor conforme a RN-TU-05. Si se omite, utiliza la duración por defecto de la prestación.
4. Ejecuta las validaciones de referencias, inicio futuro, franja de atención y bloqueos. A diferencia de la creación, la reprogramación permite elegir un inicio fuera de la grilla de horarios ofrecidos.
5. Comprueba los solapamientos excluyendo al turno original y persiste el original cancelado y el turno nuevo en un tramo síncrono, sin `await` entre la verificación de solapamiento y las escrituras.
6. La API responde 200 con el turno nuevo.

Las validaciones de horario, bloqueos, pasado, duración y referencias conservan los códigos RN-TU correspondientes. Un error previo a la persistencia no cambia el original ni crea un turno nuevo.

## Decisiones

### 1. Turno original que ya empezó o está en estado final

**Decisión: opción A — rechazar ambos casos.**

- Inicio ya alcanzado: responder 422 `RN-TU-09`.
- Estado final (`CANCELADO`, `ASISTIO`, `AUSENTE`): responder 422 `RN-TU-08`.
- Ventajas: sigue la restricción de F-03; coincide con RN-CA-03 sobre turnos ya iniciados y RN-TU-08 sobre estados finales; evita alterar historial cerrado.
- Costos: distingue dos causas con códigos distintos, que el cliente debe presentar.

### 2. Duración del turno nuevo

**Decisión confirmada con el líder: utilizar la duración por defecto de la prestación si no se envía `duracionMinutos`.**

- Si se indica una duración, debe ser un número entero entre 5 y 480 minutos inclusive y múltiplo de 5, conforme a RN-TU-05.
- Si se omite, se utiliza la duración configurada de la prestación.
- El fin se calcula en el servidor conforme a RN-TU-06.
- Ventajas: cumple RN-TU-05 y mantiene la coherencia con las reglas de agenda.
- Costos: la duración del nuevo turno puede diferir de la original si cambió la duración de la prestación o se solicita una duración personalizada.

### 3. Estado del turno nuevo

**Decisión: opción A — `RESERVADO`.**

- Ventajas: coincide con el estado inicial de creación en F-02 y evita heredar una confirmación que pudo referirse al horario anterior.
- Costos: el odontólogo tendrá que confirmar nuevamente el turno nuevo si corresponde.

### 4. Atomicidad y RN-TU-10

**Decisión: opción B — resolverlo en el caso de uso, sin cambiar puertos ni `src/infra/`.**

- El caso de uso prepara el turno nuevo y las transiciones de estado antes de la primera escritura.
- Comprueba conflictos excluyendo el turno original y, sin ningún `await`, persiste el original cancelado y el nuevo.
- Ventajas: mantiene el alcance de C-11 en el caso de uso y la API; evita cambios en archivos y contratos de C-07.
- Costos: la secuencia síncrona de escrituras depende de las operaciones que ya exponen los puertos; si no alcanza para sostener la garantía, habrá que coordinar cualquier cambio de puertos con el dueño de C-07.
- La garantía aplica al proceso Node único y a persistencia síncrona en memoria. Si se requiere cambiar puertos, se coordina con el dueño de C-07. Si la persistencia pasa a varios procesos, hará falta una garantía compartida como una transacción o restricción (RN-TU-10, PA-14).

### 5. Inicio fuera de la grilla de horarios

**Decisión confirmada con el líder: permitir la reprogramación a un inicio que no coincida con la grilla de horarios ofrecidos para la prestación.**

El odontólogo puede elegir un nuevo inicio siempre que:

- Sea estrictamente posterior al momento actual (RN-TU-04).
- El turno completo entre en una única franja de atención (RN-TU-02).
- No se superponga con bloqueos de agenda (RN-TU-03).
- No se superponga con otros turnos activos, excluyendo el turno original (RN-TU-01).
- La duración cumpla RN-TU-05.

Esta decisión no modifica las restricciones de la creación de turnos de C-07.

Se incorporará un test que compruebe que es posible desplazar un turno 15 minutos, incluso cuando el nuevo inicio no coincide con la grilla y se superpone únicamente con el turno original.

### 6. Integración con el router

**Decisión confirmada con el líder: reutilizar el soporte de rutas dinámicas incorporado por C-10 en el PR #3.**

- Se avanzará primero con el caso de uso y sus tests de dominio.
- Una vez fusionado el PR #3 en master, se actualizará la rama de C-11.
- Se reutilizará el soporte de parámetros `:id` para registrar la ruta de reprogramación.
- C-11 no modificará el router ni duplicará la implementación de rutas dinámicas.
- Esta dependencia corresponde únicamente a la integración HTTP y no al caso de uso de cancelación de C-10.

## API

`PUT /api/v1/turnos/{id}/reprogramar`

Cuerpo: `{ inicio: string, duracionMinutos?: number }`. El cliente no envía `fin`; se calcula conforme a RN-TU-06.

- 200: turno nuevo en estado `RESERVADO`.
- 404: no existe el turno original.
- 409: conflicto de agenda (`RN-TU-01` o `RN-TU-03`).
- 422: validación de destino u original no reprogramable.

## Archivos previstos para implementación

- `src/agenda/reprogramar-turno.ts`
- `src/api/turnos.ts`
- Tests de agenda y API asociados.
- `README.md`, sección de prueba de reprogramación.