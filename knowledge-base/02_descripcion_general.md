# Descripción General

## Stack tecnológico

| Capa | Tecnología | Versión mínima | Origen |
|---|---|---|---|
| Runtime | Node.js, ejecutando TypeScript **de forma nativa** (eliminación de tipos, sin compilar) | **22.18** (la máquina del líder tiene v26.13.1) | DD-12 |
| Lenguaje | TypeScript con **sintaxis borrable** únicamente: sin `enum`, sin `namespace`, sin parameter properties; `import type` para tipos | — | DD-12 |
| Dependencias | **Ninguna** dependencia npm (ni de runtime ni de desarrollo) | — | DD-12 |
| HTTP | `node:http` | — | DD-12 |
| Tests | `node:test` + `node:assert/strict` (`node --test tests/`) | — | DD-13 |
| Persistencia (MVP) | Repositorios en memoria detrás de puertos | — | DD-14 |
| Hash de contraseñas | `node:crypto` (`scrypt`) | — | DD-12 |
| Frontend | HTML + CSS + TypeScript servido por el mismo proceso Node | — | DD-09 (vigente), entrega en PA-13 |

> **Reemplazadas**: el stack Java 25 + Spring Boot + Maven (DD-01), PostgreSQL + Flyway + Testcontainers (DD-03) y Vite + Vitest para el frontend (parte de DD-09) se sustituyeron el 2026-11-24. Ver [09](09_decisiones_y_supuestos.md).

## Arquitectura general

Es un único proceso Node que sirve la API REST y los archivos del frontend:

```
[Navegador: HTML + CSS + JS] --HTTP/JSON--> [Node: src/api (node:http)] --> [src/agenda (dominio puro)]
                                                    |                              |
                                                    +--> sirve src/web/            +--> puertos --> repos en memoria
                                                    +--> genera enlace wa.me (sin llamada externa)
```

- **Dominio puro**: las reglas de agenda (RN-TU) viven en `src/agenda/` como funciones y tipos TypeScript, sin importar `node:http`. Se testean con `node:test` sin servidor.
- **Concurrencia (RN-TU-10)**: un solo proceso Node con un solo event loop. La secuencia "verificar solapamiento + guardar" se ejecuta **sin ningún `await` en el medio**, así que es atómica: dos pedidos simultáneos se procesan uno detrás del otro y el segundo ve el turno del primero. Este mecanismo reemplaza a la restricción de exclusión de PostgreSQL.
- **Zona horaria única**: `America/Argentina/Buenos_Aires` (RN-CF-01). Los instantes se representan como ISO 8601 con offset (`-03:00`) o como milisegundos UTC.
- **Sin chequeo de tipos**: Node elimina los tipos pero no los verifica. Ver PA-12.

## Integraciones externas

| Servicio | Propósito | Tipo | En el MVP |
|---|---|---|---|
| WhatsApp (click-to-chat `wa.me`) | Recordatorio de turno | Enlace URL generado. Sin API, sin cuenta Meta, sin costo | Sí |
| WhatsApp Business API | Envío automático | REST | No (etapa posterior) |
| Mercado Pago | Señas y cobros | REST | No (etapa posterior) |
| ARCA (ex AFIP) | Factura electrónica | Web service | No (etapa posterior) |

El MVP no tiene **ninguna integración externa real** (DD-05). Además, "sin dependencias" impide usar SDKs de terceros.

## API REST (resumen)

Prefijo base: `/api/v1`. Todas las respuestas son JSON.

| Recurso | Endpoints principales | Change |
|---|---|---|
| Turnos | `POST /turnos`, `GET /turnos?fecha=AAAA-MM-DD` | `crear-turno-sin-solapamientos` |
| Turnos | `POST /turnos/{id}/cancelar` | `cancelar-turno-y-liberar-horario` |
| Turnos | `PUT /turnos/{id}/reprogramar` | `reprogramar-turno` |
| Turnos | `POST /turnos/{id}/asistencia` | backlog |
| Recordatorios | `GET /turnos/{id}/recordatorio`, `POST /turnos/{id}/recordatorio/enviado` | backlog |
| Auth | `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` | backlog (obligatorio antes de datos reales) |
| Consultorio, horarios, prestaciones, pacientes, bloqueos | CRUD (ver [06](06_funcionalidades.md)) | backlog |
| Health | `GET /health` | `crear-turno-sin-solapamientos` (proyecto base) |

**Errores de negocio**: responden **409 Conflict** (solapamiento o bloqueo) o **422 Unprocessable Entity** (validación de regla), con el cuerpo `{ "codigo": "RN-TU-01", "mensaje": "...", "detalle": {...} }`.
