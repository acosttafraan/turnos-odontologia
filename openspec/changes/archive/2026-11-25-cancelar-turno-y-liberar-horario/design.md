# Design

## Context

- El código base todavía no existe. Lo aporta `crear-turno-sin-solapamientos` (Francisco), que se desarrolla en paralelo. Este change **se integra** con lo que ese change defina; no lo reimplementa.
- Stack: TypeScript ejecutado nativamente por Node, sin dependencias. Los tests usan `node:test` y la persistencia es en memoria (KB 02 y 08, DD-12 a DD-14).
- Requisitos: ver [specs/cancelacion-de-turnos/spec.md](specs/cancelacion-de-turnos/spec.md). Motivación: ver [proposal.md](proposal.md).

Piezas de `crear-turno-sin-solapamientos`, **ya mergeado en `master`** (`4814316`) y verificado contra el código real el 2026-11-25:

| Pieza real | Para qué la usa este change | Estado |
|---|---|---|
| `Turno`, `EstadoTurno`, `TipoCancelacion` (`src/agenda/tipos.ts`) | Leer y devolver el turno cancelado | ✅ Existe |
| `transicionarEstado(turno, 'CANCELADO', { tipo, canceladoEn, actualizadoEn })` (`src/agenda/estado.ts`) | Pasar a `CANCELADO` sin duplicar las transiciones. Si el destino no está permitido, lanza `RN-TU-08` | ✅ Acepta tipo y momento |
| `esActivo(estado)` (`src/agenda/estado.ts`) | Saber si el turno es `RESERVADO` o `CONFIRMADO` | ✅ Existe |
| `agenda.turnos.obtener(id)` / `guardar(turno)`: síncronos | Buscar y guardar | ✅ Existe |
| `agenda.reloj.ahora()`: devuelve **milisegundos** | Medir la anticipación | ✅ Es un objeto, no una función |
| `isoLocal(instante)` (`src/agenda/fecha.ts`) | Registrar `canceladoEn` en ISO con offset `-03:00` | ✅ Existe |
| `ReglaNegocioError(codigo, mensaje, detalle)` → 422 (salvo los códigos de conflicto) | Rechazar con `RN-CA-03` | ✅ 422 por defecto |
| `ErrorHttp(404, ...)` (`src/api/errores.ts`) | Turno inexistente | ✅ Existe |
| `Agenda.anticipacionCancelacionHoras` | La anticipación mínima | ❌ **No existe**: `Agenda` solo expone `consultorioId`. La agrega este change (D7) |
| Rutas con parámetros (`/turnos/{id}/...`) | Registrar `POST /api/v1/turnos/{id}/cancelar` | ❌ **No existe**: el router busca la ruta exacta (`método + ruta`). Lo agrega este change (D8) |

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
`cancelarTurno(agenda: Agenda, turnoId: string): Turno | undefined` sigue la misma forma que `crearTurno(agenda, ...)` y hace lo siguiente:
1. Obtiene el turno con `agenda.turnos.obtener(turnoId)`. Si no existe, devuelve `undefined` y la API responde 404.
2. Verifica RN-CA-03: `esActivo(turno.estado)` y `ahora < Date.parse(turno.inicio)`. Si no se cumple, lanza `ReglaNegocioError('RN-CA-03', ...)`.
3. Calcula `anticipacion = Date.parse(turno.inicio) - ahora` en milisegundos, con `ahora = agenda.reloj.ahora()`.
4. Clasifica la cancelación: `EN_TERMINO` si `anticipacion >= agenda.anticipacionCancelacionHoras * 60 * MINUTO`; `TARDIA` en otro caso.
5. Aplica `transicionarEstado(turno, 'CANCELADO', { tipo, canceladoEn: isoLocal(ahora), actualizadoEn: isoLocal(ahora) })` y guarda.

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
- `tests/agenda/cancelar-turno.test.ts`: un test por escenario del spec, con reloj fijo (`{ ahora: () => ... }`) y el repositorio en memoria real de `crearAgendaEnMemoria` (sin mocks). El ID del escenario (`C10-NN`) y el código RN van en el nombre de cada test, igual que en C-07.
- `tests/api/cancelar-turno.test.ts`: los escenarios HTTP (200, 404 y 422), reutilizando los helpers de Francisco (`iniciarAgenda`, `turnoDemo`, `hora`, `AHORA` en `tests/api/agenda-prueba.ts`).
- El escenario "dar un turno nuevo en el horario liberado" usa el `POST /api/v1/turnos` real, con «Consulta general» de 20 minutos y un horario ofrecido (múltiplo de 20 desde las 08:00).

### D7: `Agenda` expone la anticipación mínima de cancelación
Se agrega `anticipacionCancelacionHoras: number` al tipo `Agenda` (`src/agenda/puertos.ts`). `crearAgendaEnMemoria` (`src/infra/memoria.ts`) la completa con `datos.consultorio.anticipacionCancelacionHoras`.
- Es lo que pidió Stefano en la revisión del PR #1 (comentario 1). Francisco lo dejó para este change.
- **Alternativa descartada**: pasar el consultorio entero. Expone más datos de los que el dominio necesita.

### D8: El router acepta parámetros de ruta
`crearRouter().registrar` acepta segmentos `:nombre` (por ejemplo `/api/v1/turnos/:id/cancelar`) y entrega los valores al manejador como tercer argumento, `params: Record<string, string>`.
- Las rutas exactas se siguen buscando primero, así que el comportamiento de C-07 no cambia (sus 36 tests tienen que seguir en verde).
- El cambio es **compatible con `reprogramar-turno`** (Martina, `PUT /api/v1/turnos/:id/reprogramar`), que necesita exactamente lo mismo. Hay que avisarle para que lo reutilice y no haga otra versión.
- **Alternativa descartada**: `POST /api/v1/turnos/cancelar` con el `id` en el cuerpo. No hace falta tocar el router, pero se aparta del spec y de la convención REST que también usa Martina.

## Risks / Trade-offs

- **[Resuelto]** Los nombres y firmas de crear-turno ya se verificaron contra el código mergeado (tabla de Context).
- **[Riesgo]** Conflicto de merge con `reprogramar-turno` en `src/api/router.ts` (D8) y `src/api/turnos.ts`. → **Mitigación**: avisarle a Martina que reutilice los parámetros de ruta de este change. La ruta de cancelación va en su propio bloque. Hacer merge de `master` antes del PR.
- **[Riesgo]** Agregar un campo a `Agenda` (D7) rompe a quien arme una `Agenda` a mano. → **Mitigación**: hoy solo la arma `crearAgendaEnMemoria`, así que se actualiza ahí y se corren los 36 tests de C-07.
- **[Trade-off]** Este change no se puede aplicar hasta que crear-turno esté en `master`. Mientras tanto quedan listos proposal, specs, design y tasks.

## Open Questions

- Ninguna que cambie los specs. Los nombres exactos de las piezas de crear-turno se confirman cuando su PR esté abierto.
