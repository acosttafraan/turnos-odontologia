# Proposal

## Why

Cuando un paciente avisa que no puede venir, el odontólogo necesita cancelar el turno y recuperar ese horario para otro paciente. Además, tiene que poder distinguir las cancelaciones con aviso de las de último momento. Sin esto, la agenda acumula turnos que ya no se van a cumplir y el horario queda bloqueado (Discovery: "cancelar un turno y liberar el horario" es imprescindible en el MVP, informe sección D.3).

**Por qué este change**, en cumplimiento de la consigna:
- Pertenece al MVP recomendado en la sección D.3.
- Tiene reglas de negocio verificables (RN-CA-01 a RN-CA-04).
- Es una sola funcionalidad chica.
- La consigna lo menciona como ejemplo válido.

Lo conduce Stefano Senatore (DD-16 y DD-17).

## What Changes

- El odontólogo puede **cancelar** un turno vigente (`RESERVADO` o `CONFIRMADO`) que todavía no empezó.
- La cancelación se clasifica automáticamente según la anticipación respecto de la mínima configurada (24 h por defecto, RN-CF-02):
  - **`EN_TERMINO`** si la anticipación es mayor o igual a la mínima, **incluido el caso de exactamente 24 h**.
  - **`TARDIA`** si es menor.
- Una cancelación tardía **no** convierte el turno en ausencia (RN-CA-04).
- El turno cancelado **libera su horario de inmediato**: se puede dar otro turno en ese mismo intervalo (RN-CA-02).
- Se rechaza cancelar un turno que **ya empezó** (el momento actual es igual o posterior a su inicio) o que está en un estado final (`CANCELADO`, `ASISTIO`, `AUSENTE`), con el código `RN-CA-03`.
  - **Decisión de este change**: cancelar un turno ya cancelado se rechaza. No es una operación idempotente.
- Nueva ruta HTTP `POST /api/v1/turnos/{id}/cancelar`.
- El `README.md` suma la sección "Cómo probar: cancelar un turno".

**Fuera de alcance**: motivo de cancelación, cancelación iniciada por el paciente, notificación al paciente, reportes de cancelaciones y pantalla web para cancelar (backlog `frontend-acciones-de-turno`).

## Capabilities

### New Capabilities
- `cancelacion-de-turnos`: cancelación de turnos de la agenda. Cubre cuándo se puede cancelar, cómo se clasifica (en término o tardía), el efecto sobre el horario y los rechazos.

### Modified Capabilities
- Ninguna. La capacidad de creación de turnos la define en paralelo `crear-turno-sin-solapamientos` (Francisco) y este change no modifica sus requisitos: solo depende de que un turno cancelado no bloquee el horario, que ya está previsto en RN-TU-01.

## Impact

- **Código nuevo**: `src/agenda/cancelar-turno.ts` (caso de uso de dominio) y la ruta en `src/api/turnos.ts`.
- **Depende de `crear-turno-sin-solapamientos`**, que todavía no está implementado: el tipo `Turno`, la función de transición de estado (RN-TU-08), el puerto del repositorio de turnos, el reloj inyectable, la semilla con la anticipación de 24 h y el traductor de errores a HTTP. El **apply** de este change se hace recién cuando ese change esté en `master`.
- **Tests**: `tests/agenda/` (dominio, con reloj fijo) y `tests/api/` (HTTP).
- **Sin dependencias nuevas** (DD-12) y solo datos ficticios (RN-DA-01).
- **Documentación**: sección nueva en `README.md`.
