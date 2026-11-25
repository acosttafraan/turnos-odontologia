# Diseño: reprogramar-turno

## Contexto

C-11 depende de C-07. El roadmap establece que la reprogramación agrega un caso de uso y una ruta, reutiliza `transicionarEstado` y no depende del caso de uso de cancelación de C-10.

El modelo `Turno` contiene `duracionMinutos`, `estado`, `tipoCancelacion`, `reprogramadoDesdeId`, `creadoEn` y `actualizadoEn`. El estado inicial del flujo de creación en F-02 es `RESERVADO`. La persistencia del MVP es en memoria (DD-14).

## Flujo propuesto

1. La API valida el cuerpo `{ inicio, duracionMinutos? }`, busca el turno por id y responde 404 si no existe.
2. El caso de uso comprueba que el turno original se pueda reprogramar según su estado y momento de inicio.
3. Calcula el turno nuevo antes de la primera escritura. Si no se envió `duracionMinutos`, conserva la duración original, pendiente de confirmar con el líder por apartarse de RN-TU-05.
4. Ejecuta las validaciones de agenda que usa la creación, excluyendo al original del chequeo de RN-TU-01.
5. En el caso de uso, vuelve a comprobar conflictos y persiste el original cancelado y el turno nuevo en un tramo síncrono, sin `await` entre la verificación de solapamiento y las escrituras.
6. La API responde 200 con el turno nuevo.

Las validaciones de horario, bloqueos, pasado, duración y referencias conservan los códigos RN-TU correspondientes. Un error previo a la persistencia no cambia el original.

## Decisiones

### 1. Turno original que ya empezó o está en estado final

**Decisión: opción A — rechazar ambos casos.**

- Inicio ya alcanzado: responder 422 `RN-TU-09`.
- Estado final (`CANCELADO`, `ASISTIO`, `AUSENTE`): responder 422 `RN-TU-08`.
- Ventajas: sigue la restricción de F-03; coincide con RN-CA-03 sobre turnos ya iniciados y RN-TU-08 sobre estados finales; evita alterar historial cerrado.
- Costos: distingue dos causas con códigos distintos, que el cliente debe presentar.

### 2. Duración del turno nuevo si no se envía `duracionMinutos`

**Decisión: opción A — conservar la duración del turno original. Pendiente de confirmar con el líder.**

- Ventajas: mover el turno conserva el tiempo que ya estaba reservado, incluso si cambió la duración por defecto de la prestación.
- Costos: se aparta de RN-TU-05, que establece que si no se indica duración se usa la duración de la prestación. El líder debe confirmar esta especialización para la reprogramación.

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

## API

`PUT /api/v1/turnos/{id}/reprogramar`

Cuerpo: `{ inicio: string, duracionMinutos?: number }`. El cliente no envía `fin`; se calcula conforme a RN-TU-06.

- 200: turno nuevo en estado `RESERVADO`.
- 404: no existe el turno original.
- 409: conflicto de agenda (`RN-TU-01` o `RN-TU-03`).
- 422: validación de destino u original no reprogramable.

## Archivos previstos para implementación futura

- `src/agenda/reprogramar-turno.ts`
- `src/api/turnos.ts`
- Tests de agenda y API asociados.
- `README.md`, sección de prueba de reprogramación.
