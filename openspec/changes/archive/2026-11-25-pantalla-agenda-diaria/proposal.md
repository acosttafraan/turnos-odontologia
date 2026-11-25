## Why

El odontólogo necesita consultar su jornada y distinguir los horarios de atención, los bloqueos y los turnos asignados. C-17 entrega una vista diaria de solo lectura que se integra al servidor local de C-07.

## What Changes

- Servir la pantalla en `http://127.0.0.1:3000/agenda.html` y consultar `GET /api/v1/turnos?fecha=AAAA-MM-DD`.
- Mostrar franjas, bloqueos y turnos ordenados con paciente, prestación y estado.
- Permitir navegar al día anterior, al siguiente y a hoy. Mostrar estados vacíos y errores con el código RN cuando la API lo devuelva.
- Agregar pruebas de presentación e integración HTTP y una sección de prueba manual en el README.

## Capabilities

### New Capabilities

- `agenda-diaria` muestra la jornada del consultorio en una vista accesible de solo lectura.

### Modified Capabilities

Ninguna.

## Impact

Afecta a `src/web/`, `src/api/estaticos.ts`, el registro de rutas, las pruebas y el README. La agenda semanal y la edición de turnos quedan fuera del alcance de C-17. La publicación de C-17 depende de la integración de C-07 en `master`.
