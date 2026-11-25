# Actores y Roles

## Actores del sistema

| Actor | Descripción | Cómo interactúa |
|---|---|---|
| Odontólogo (rol `ODONTOLOGO`) | Profesional independiente, dueño del consultorio y único usuario del MVP | Frontend web → API REST autenticada |
| Paciente | Persona atendida. Es un dato del sistema, no un usuario | Recibe el mensaje de WhatsApp que el odontólogo envía desde su teléfono o computadora |
| Sistema (tiempo) | Reloj del servidor en zona `America/Argentina/Buenos_Aires` | Determina qué es "pasado" y la anticipación de las cancelaciones |

**Suposición:** en el MVP no hay rol de secretaria ni de administrador. Agregar más profesionales o una secretaria queda para etapas posteriores. Ver la pregunta abierta PA-07 en el archivo 10.

## RBAC: matriz de permisos

| Rol | Recurso | Permisos |
|---|---|---|
| ODONTOLOGO | Consultorio y horarios | Leer, Actualizar |
| ODONTOLOGO | Bloqueos | Crear, Leer, Eliminar |
| ODONTOLOGO | Prestaciones | Crear, Leer, Actualizar, Activar/Desactivar (no se borran) |
| ODONTOLOGO | Pacientes | Crear, Leer, Actualizar (no se borran en el MVP) |
| ODONTOLOGO | Turnos | Crear, Leer, Reprogramar, Cancelar, Registrar asistencia |
| ODONTOLOGO | Recordatorios | Generar enlace, Marcar enviado |
| Anónimo | Ninguno | Solo login y health check |

## Rutas públicas

- `POST /api/v1/auth/login`
- `GET /actuator/health`
- Estáticos del frontend: `/`, `/login`, assets. Sin datos.

**Gobernanza:** la autenticación es un dominio **CRÍTICO** según las reglas del agente. Cualquier cambio de código en auth requiere aprobación humana explícita.
