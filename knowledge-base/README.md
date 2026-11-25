# turnos-odontologia: Base de Conocimiento

La base de conocimiento se generó el 2026-11-24 a partir del Discovery del proyecto:

- [discovery.md](../docs/discovery/discovery.md)
- [informe-discovery.md](../docs/discovery/informe-discovery.md)
- [relevamiento de fuentes](../docs/discovery/sources/relevamiento-fuentes.md)

## Índice de archivos

| Archivo | Contenido |
|---|---|
| [01_vision_y_objetivos.md](01_vision_y_objetivos.md) | Propósito, objetivos, alcance del MVP, fuera de alcance, posicionamiento frente a la competencia |
| [02_descripcion_general.md](02_descripcion_general.md) | Stack (TypeScript nativo en Node ≥ 22.18, sin dependencias; `node:http`, `node:test`, persistencia en memoria), arquitectura, integraciones, resumen de la API |
| [03_actores_y_roles.md](03_actores_y_roles.md) | Odontólogo como único usuario, paciente como dato, RBAC, rutas públicas |
| [04_modelo_de_datos.md](04_modelo_de_datos.md) | Entidades, ERD, restricción de exclusión, datos semilla ficticios |
| [05_reglas_de_negocio.md](05_reglas_de_negocio.md) | Reglas RN-CF, RN-AG, RN-PR, RN-PA, **RN-TU (solapamientos)**, RN-CA, RN-AS, RN-RE, RN-DA |
| [06_funcionalidades.md](06_funcionalidades.md) | Historias de usuario por épica, con criterios de aceptación y backlog |
| [07_flujos_principales.md](07_flujos_principales.md) | Flujos de login, crear, reprogramar y cancelar turno, recordatorio `wa.me`, asistencia y bloqueos |
| [08_arquitectura_propuesta.md](08_arquitectura_propuesta.md) | Arquitectura hexagonal, directorios, estrategia de tests, seguridad, variables de entorno |
| [09_decisiones_y_supuestos.md](09_decisiones_y_supuestos.md) | DD-01 a DD-16 (DD-01 y DD-03 reemplazadas) y supuestos SU-02 a SU-04 |
| [10_preguntas_abiertas.md](10_preguntas_abiertas.md) | Inconsistencias, preguntas priorizadas y puntos "No evidenciado" |

## Quick Start para desarrolladores

1. Entender el dominio: [01](01_vision_y_objetivos.md), [03](03_actores_y_roles.md).
2. Entender los datos: [04](04_modelo_de_datos.md).
3. Entender las reglas: [05](05_reglas_de_negocio.md), sobre todo RN-TU.
4. Entender la arquitectura: [02](02_descripcion_general.md), [08](08_arquitectura_propuesta.md).
5. Implementar: [07](07_flujos_principales.md), [06](06_funcionalidades.md).
6. Antes de escribir código, revisar [10](10_preguntas_abiertas.md).

## Resumen ejecutivo

Agenda de turnos para el **odontólogo independiente argentino**. Su núcleo son reglas de agenda verificables:

- Sin solapamientos, con intervalos `[inicio, fin)`.
- Dentro del horario de atención y fuera de los bloqueos.
- Cancelación en término o tardía según una anticipación configurable.

El diferencial del MVP es el **recordatorio por WhatsApp con `wa.me`, sin costo por mensaje**. El MVP no tiene integraciones externas reales. El primer change recomendado para OPSX es **US-030, "Crear turno evitando solapamientos del profesional"**.
