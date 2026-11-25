# Design

## Context

- El código base todavía no existe. Lo aporta `crear-turno-sin-solapamientos` (Francisco), que se desarrolla en paralelo. Este change **se integra** con lo que ese change defina; no lo reimplementa.
- Stack: TypeScript ejecutado nativamente por Node, sin dependencias. Los tests usan `node:test` y la persistencia es en memoria (KB 02 y 08, DD-12 a DD-14).
- Requisitos: ver [specs/cancelacion-de-turnos/spec.md](specs/cancelacion-de-turnos/spec.md). Motivación: ver [proposal.md](proposal.md).

Piezas que se esperan de `crear-turno-sin-solapamientos`, según la ficha C-07 de `CHANGES.md` y la KB 04 y 08:

| Pieza | Para qué la usa este change |
|---|---|
| Tipos `Turno`, `EstadoTurno`, `TipoCancelacion` (`src/agenda/tipos.ts`) | Leer y devolver el turno cancelado |
| `transicionarEstado(turno, destino, opciones?)` (`src/agenda/estado.ts`, RN-TU-08) | Pasar a `CANCELADO` con su tipo sin duplicar la lógica de transiciones |
| Puerto `TurnosRepo` (`obtener`, `guardar`) | Buscar el turno y guardar el resultado |
| Reloj inyectable (`src/agenda/reloj.ts`) | Medir la anticipación de forma determinista en los tests |
| Consultorio de la semilla, con `anticipacionCancelacionHoras = 24` | Obtener la anticipación mínima |
| `ReglaNegocioError` y su traductor a HTTP (`src/api/errores.ts`) | Responder 422 con `{ codigo, mensaje, detalle }` |
| Router y `src/api/turnos.ts` | Registrar la ruta nueva |

## Goals / Non-Goals

**Goals:**
- Un caso de uso de dominio puro, `cancelarTurno`, que se pueda testear sin servidor.
- Una ruta HTTP fina que solo valide la entrada y traduzca errores.
- Agregar archivos nuevos en lugar de modificar los de crear-turno, para minimizar conflictos de merge.

**Non-Goals:**
- Cambiar cómo se crean turnos o cómo se verifica el solapamiento. Que un cancelado no bloquee el horario ya es responsabilidad de RN-TU-01 en crear-turno.
- Cualquier pantalla web.

## Decisions

### D1: Caso de uso propio en `src/agenda/cancelar-turno.ts`
`cancelarTurno({ turnoId }, { turnosRepo, consultorio, reloj })` hace lo siguiente:
1. Obtiene el turno. Si no existe, devuelve "no encontrado".
2. Verifica RN-CA-03: el estado tiene que ser `RESERVADO` o `CONFIRMADO` y `ahora < inicio`.
3. Calcula `anticipacion = inicio - ahora` en milisegundos.
4. Clasifica la cancelación: `EN_TERMINO` si `anticipacion >= anticipacionCancelacionHoras * 3 600 000`; `TARDIA` en otro caso.
5. Aplica `transicionarEstado(turno, 'CANCELADO', { tipo, en: ahora })` y guarda.

- **Alternativa descartada**: agregar la lógica dentro de `crear-turno.ts` o de `estado.ts`. Se descarta porque toca archivos de Francisco y genera conflictos.

### D2: Comparar instantes en milisegundos, con `>=` para el borde
El límite de exactamente 24 h es en término (RN-CA-01), por eso se usa `>=` sobre milisegundos (`Date.parse` del ISO con offset), nunca una comparación de texto (regla dura de fechas). `ahora >= inicio` se considera "ya empezó" (escenario borde del spec).

### D3: Cancelar un turno ya cancelado devuelve `RN-CA-03`, no es idempotente
Lo decidió Stefano en el explore del 2026-11-25. Es coherente con RN-CA-03 y con RN-TU-08 (`CANCELADO` es un estado final) y no obliga a modificar la KB.
- **Alternativa descartada**: responder 200 sin cambios. Es más tolerante con un doble clic, pero contradice la regla tal como está escrita.

### D4: Sin `await` entre leer, verificar y guardar
El caso de uso es síncrono de punta a punta, igual que crear-turno (RN-TU-10). Así, un "crear" y un "cancelar" simultáneos sobre el mismo horario no pueden intercalarse.

### D5: Códigos HTTP
- 200 devuelve el turno actualizado, con `estado`, `tipoCancelacion` y `canceladoEn`.
- 404 cuando el `id` no existe.
- 422 con `RN-CA-03` cuando el turno no se puede cancelar.

Se usa 422 y no 409 porque no es un conflicto de agenda, sino una regla de estado (KB 05 §Excepciones globales).

### D6: Tests
- `tests/agenda/cancelar-turno.test.ts`: un test por escenario del spec, con reloj fijo y repositorio en memoria real (sin mocks). El código RN va en el nombre de cada test.
- `tests/api/cancelar-turno.test.ts`: los escenarios HTTP (200, 404 y 422), levantando el servidor en el puerto 0.
- El escenario "dar un turno nuevo en el horario liberado" usa el caso de uso real de crear-turno.

## Risks / Trade-offs

- **[Riesgo]** Francisco implementa con otros nombres o firmas (`transicionarEstado`, `TurnosRepo`, campo de anticipación). → **Mitigación**: el spec no depende de esos nombres. Si cambian, se actualiza este `design.md` con `/openspec-update-change` antes del apply.
- **[Riesgo]** `transicionarEstado` no acepta el tipo y el momento de la cancelación. → **Mitigación**: coordinar con Francisco en la revisión de su PR. Como último recurso, completar `tipoCancelacion` y `canceladoEn` en este caso de uso después de la transición.
- **[Riesgo]** Conflicto de merge en `src/api/turnos.ts`, donde Martina también agrega su ruta. → **Mitigación**: agregar la ruta en un bloque propio y hacer merge de `master` antes del PR.
- **[Trade-off]** Este change no se puede aplicar hasta que crear-turno esté en `master`. Mientras tanto quedan listos proposal, specs, design y tasks.

## Open Questions

- Ninguna que cambie los specs. Los nombres exactos de las piezas de crear-turno se confirman cuando su PR esté abierto.
