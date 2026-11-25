# Proposal

## Why

El paciente necesita elegir una prestación y reservar un horario disponible. El odontólogo define de antemano las franjas de atención y la duración de cada prestación, y puede consultar los turnos del día. C-07 establece el flujo por API y evita la doble reserva.

## What Changes

- Crear el proyecto base y el README con instrucciones para arrancar el servidor, ejecutar las pruebas y probar el cambio con datos ficticios.
- Precargar una configuración ficticia para la demo con una franja de 08:00 a 16:00 por día hábil y «Consulta general» de 20 minutos.
- Consultar los horarios libres de una prestación con `GET /api/v1/disponibilidad?fecha=AAAA-MM-DD&prestacionId=...`. Para «Consulta general», los horarios posibles van de 08:00 a 15:40 en pasos de 20 minutos. Los turnos activos y los bloqueos pueden reducir esa lista.
- Confirmar con `POST /api/v1/turnos`. El paciente elige prestación y hora, el servidor toma la duración configurada, calcula el fin y vuelve a validar el horario antes de guardar el turno como `RESERVADO`. Si se ocupó, la respuesta indica que elija otro horario.
- Conservar la ruta de salud `GET /api/v1/health` y el listado `GET /api/v1/turnos?fecha=AAAA-MM-DD` para la agenda diaria del consultorio.
- Reservar en una sola agenda. El control de solapamiento se aplica al profesional porque el MVP modela un consultorio unipersonal. Los sillones y boxes quedan fuera del modelo (IN-01).
- El panel de configuración del odontólogo, la pantalla pública de reserva, la pantalla de agenda, la autenticación, la cancelación, la reprogramación y la persistencia duradera quedan fuera de C-07.

## Capabilities

### New Capabilities

- `agenda-turnos` — Consulta de disponibilidad por prestación, confirmación de reservas y consulta de la agenda diaria.

### Modified Capabilities

## Impact

- Se incorporan `package.json`, `.env.example`, `README.md`, `src/main.ts`, `src/agenda/`, `src/infra/` y `src/api/`.
- Las pruebas de dominio y HTTP quedan en `tests/agenda/` y `tests/api/`. El servidor escucha en `127.0.0.1:3000` y usa repositorios en memoria con datos ficticios.
