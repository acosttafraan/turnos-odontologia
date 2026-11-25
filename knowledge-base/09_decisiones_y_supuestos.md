# Decisiones y Supuestos

## Decisiones documentadas

### DD-01: Backend en Java 25 + Spring Boot + Maven (REEMPLAZADA por DD-12, 2026-11-24)
**Decisión original**: el backend se implementa en Java 25 LTS con Spring Boot y Maven.
**Contexto**: la consigna deja el stack a elección del equipo.
**Alternativas consideradas**: TypeScript + Node (Fastify, Vitest), Python + FastAPI (pytest).
**Justificación**: la eligió el usuario el 2026-11-24. JDK 25 y Maven 3.10 ya están instalados en la máquina del líder.
**Trade-offs aceptados**: es más verboso que las alternativas y usa un lenguaje distinto del frontend.

### DD-02: MVP como API REST + frontend web mínimo
**Decisión**: el MVP incluye una API REST y un frontend web mínimo (ver DD-09).
**Contexto**: la consigna admite una API sin UI. El usuario eligió incluir frontend.
**Alternativas consideradas**: API sin UI.
**Justificación**: hace el producto usable por un odontólogo real.
**Trade-offs aceptados**: hay más superficie para el TP. El change de la Etapa 6 puede limitarse al backend.

### DD-03: PostgreSQL + Flyway, con Docker en local (REEMPLAZADA por DD-14, 2026-11-24)
**Decisión original**: la persistencia es PostgreSQL con migraciones Flyway y `docker-compose.yml` para desarrollo.
**Justificación**: PostgreSQL admite restricciones de exclusión sobre rangos de tiempo (RN-TU-10), que no están disponibles en H2 ni en MySQL. Docker ya está instalado.
**Trade-offs aceptados**: los tests de integración dependen de Docker (Testcontainers).

### DD-04: Pruebas por escenario del spec
**Decisión**: cada escenario dado/cuando/entonces de OpenSpec tiene un test automatizado con el código RN en el nombre.
**Justificación**: la consigna lo exige en la Etapa 6 y da trazabilidad entre spec, test y regla.

### DD-05: Sin integraciones externas reales en el MVP
**Decisión**: WhatsApp se resuelve con enlaces `wa.me`. Mercado Pago, ARCA y WhatsApp Business API quedan para después.
**Contexto**: sección 8 del Discovery.
**Justificación**: controla el alcance del TP (riesgo priorizado por el usuario) y evita el costo por mensaje de Meta.
**Trade-offs aceptados**: el envío no es automático, así que el diferencial es más débil que el de los competidores con API (ver riesgo en el Discovery).

### DD-06: Un solo profesional, sin sillones
**Decisión**: el segmento es el odontólogo independiente y la regla de solapamiento es solo por profesional.
**Contexto**: Discovery, preguntas sobre segmento y sillones.
**Alternativas consideradas**: consultorio de 2 a 5 profesionales con sillones; modelar sillón/box.
**Justificación**: es un MVP más simple. El modelo guarda `consultorio_id` para poder crecer.
**Trade-offs aceptados**: el change sugerido por la consigna pierde la dimensión "sillón" (ver IN-01).

### DD-07: Intervalos semiabiertos `[inicio, fin)`
**Decisión**: los turnos y bloqueos se comparan como intervalos semiabiertos.
**Justificación**: permite turnos consecutivos sin hueco. Es el caso borde que pide la consigna.

### DD-08: Reprogramar = cancelar en término + crear turno nuevo
**Decisión**: reprogramar no edita el turno existente: lo cancela y crea uno nuevo enlazado al original.
**Justificación**: conserva el historial y reutiliza las mismas validaciones que la creación.
**Trade-offs aceptados**: hay más filas. Una reprogramación no cuenta como cancelación tardía aunque se haga con poca anticipación (DD-10).

### DD-09: Frontend en HTML + CSS + TypeScript sin framework
**Decisión**: la interfaz web se construye con HTML, CSS y TypeScript compilado a JavaScript, sin framework de UI. ~~Vite se usa solo para compilar el TypeScript y servir el entorno de desarrollo, y se puede reemplazar por `tsc`. Los tests usan Vitest con jsdom.~~ **Actualizado el 2026-11-24 (DD-12):** sin Vite ni Vitest, porque no hay dependencias. El frontend lo sirve el propio proceso Node, la entrega del TypeScript al navegador está en PA-13 y los tests usan `node:test` sobre funciones puras.
**Contexto**: la KB había supuesto React + Vite + TypeScript (supuesto SU-01, ya retirado). El usuario lo corrigió con Ajustar el 2026-11-24.
**Alternativas consideradas**: React + Vite + TypeScript, Thymeleaf, Angular.
**Justificación**: elección del usuario. Tiene menos dependencias y el equipo trabaja directo con la plataforma web.
**Trade-offs aceptados**: el manejo del DOM y del estado se escribe a mano, y no hay componentes reutilizables de un framework.

### DD-10: Reglas de bloqueo y cancelación confirmadas
**Decisión**: el usuario confirmó tres reglas que la KB había propuesto:
- **RN-AG-03 (ex PA-05):** un bloqueo que se superpone con turnos activos se rechaza con 409 y la lista de turnos en conflicto.
- **RN-CA-04 (ex PA-01):** la cancelación tardía se registra pero no cuenta como ausencia.
- **RN-TU-09 (ex PA-06):** reprogramar nunca cuenta como cancelación tardía.

**Contexto**: Ajustar de la KB, 2026-11-24.
**Justificación**: comportamiento conservador. El sistema no cancela turnos por su cuenta ni penaliza al paciente automáticamente.

### DD-11: La política visual se mantiene en "off"
**Decisión**: no se crean sistema de diseño ni mockups, aunque el MVP incluya un frontend web.
**Contexto**: se resuelve la inconsistencia IN-02 (Ajustar, 2026-11-24).
**Justificación**: el TP no evalúa la UI. La interfaz es funcional y mínima.
**Trade-offs aceptados**: no hay una guía visual acordada. Se puede revisar con `/active-orchestrator design`.

### DD-12: TypeScript nativo en Node ≥ 22.18, sin dependencias
**Decisión**: todo el sistema (API, dominio y frontend) se escribe en TypeScript y Node lo ejecuta directamente, eliminando los tipos sin compilar. No hay ninguna dependencia npm. Solo se usa la biblioteca estándar: `node:http`, `node:test`, `node:crypto` y `node:assert`.
**Contexto**: el usuario corrigió el stack el 2026-11-24, durante la fase de modo equipo. Reemplaza a DD-01, a DD-03 y a la parte de herramientas de DD-09.
**Alternativas consideradas**: Java 25 + Spring Boot (DD-01), Node con framework (Express o Fastify) y Vitest.
**Justificación**: elección del equipo. Simplifica la instalación (solo Node) y el README reproducible, y no hay superficie de cadena de suministro.
**Trade-offs aceptados**:
- No hay chequeo de tipos (PA-12).
- Solo se admite sintaxis TypeScript borrable: nada de `enum`, `namespace` ni parameter properties.
- Los imports llevan la extensión `.ts`.
- Todo lo que normalmente da un framework (router, parseo de JSON, cookies) se escribe a mano.

### DD-13: Tests con `node:test`
**Decisión**: se usa el runner nativo `node --test`, con `node:assert/strict`. Cada escenario de OpenSpec es un `test()` con el código RN en su nombre.
**Reemplaza**: JUnit, Testcontainers y Vitest.

### DD-14: Persistencia en memoria detrás de puertos en el MVP
**Decisión**: los repositorios del MVP son `Map` en memoria. Los datos semilla ficticios se cargan al arrancar.
**Justificación**: no hay dependencias ni base de datos externa, y alcanza para los cuatro changes del TP y sus tests.
**Trade-offs aceptados**: los datos se pierden al reiniciar. La persistencia duradera queda pendiente (PA-14). RN-TU-10 se garantiza por atomicidad del event loop, no por una restricción de base de datos.

### DD-15: Auth después de los cuatro changes del TP, con API solo local
**Decisión**: `acceso-autenticacion` queda en el backlog. Mientras tanto, la API escucha solo en `127.0.0.1` y usa exclusivamente datos ficticios.
**Contexto**: los cuatro changes con dueño no deben bloquearse por un dominio CRÍTICO.
**Trade-offs aceptados**: RN-DA-02 (acceso solo autenticado) queda **suspendida temporalmente** en desarrollo. Es **obligatorio** completar `acceso-autenticacion` antes de cualquier despliegue o de cargar datos reales.

### DD-16: Un change por integrante, cada uno conduce su ciclo OPSX
**Decisión**: cada integrante conduce su propio ciclo OPSX completo:
- Francisco Acosta: `crear-turno-sin-solapamientos`.
- Stefano Senatore: `cancelar-turno-y-liberar-horario`.
- Martina Vergara: `reprogramar-turno` (backend + API).
- Maximiliano Moreno: `pantalla-agenda-diaria` (frontend).

Francisco lidera: mantiene `master`, ordena la secuencia y revisa los PR, pero no conduce los ciclos de los demás. A los PR de Francisco los revisa Stefano.
**Contexto**: definido por el equipo el 2026-11-24.
**Trade-offs aceptados**: `crear-turno-sin-solapamientos` bloquea a los otros tres changes, así que tiene que cerrarse primero.

### DD-17: Un único change por integrante en el TP
**Decisión**: por falta de tiempo, el TP implementa exactamente cuatro changes, uno por persona:
- Francisco: `crear-turno-sin-solapamientos`. Absorbe el proyecto base (ex `scaffolding-node-typescript`) y el README inicial.
- Stefano: `cancelar-turno-y-liberar-horario`.
- Martina: `reprogramar-turno`.
- Maximiliano: `pantalla-agenda-diaria`.

`readme-y-entrega` deja de ser un change: cada PR suma su sección "Cómo probar" al README, y el líder hace la prueba final en un clon limpio como control de entrega.
**Contexto**: el equipo lo decidió el 2026-11-24, después de la fundación.
**Alternativas consideradas**: el roadmap anterior, en el que Francisco tenía tres changes (scaffolding, crear-turno y readme).
**Justificación**: el camino crítico baja de 4 pasos a 2, y los otros tres pueden hacer explore y propose sin esperar código.
**Trade-offs aceptados**: `crear-turno-sin-solapamientos` es más grande y sigue bloqueando el apply de los otros tres. El backlog (12 changes) no entra al TP.

## Supuestos inferidos

> SU-01 (frontend React) se retiró: lo reemplaza DD-09.

### SU-02: El odontólogo envía el WhatsApp desde su propio dispositivo
**Supuesto**: el odontólogo tiene WhatsApp o WhatsApp Web en el equipo desde el que usa la aplicación.
**Origen**: decisión de usar `wa.me`.
**Riesgo si es falso**: el recordatorio no se puede enviar con un clic.
**Cómo validar**: entrevistar a 2 o 3 odontólogos (fuera del alcance del TP).

### SU-03: El independiente prefiere no pagar por mensaje antes que tener envío automático
**Supuesto**: es el diferencial del MVP.
**Origen**: riesgo 3 del Discovery.
**Riesgo si es falso**: el producto no se distingue de AgendaPro o DentalSoft.
**Cómo validar**: preguntarlo en las demos con odontólogos.

### SU-04: Las cifras de los competidores son autodeclaradas
**Supuesto**: la evidencia del informe es mayormente comercial y la verificación personal de fuentes está pendiente.
**Origen**: informe de Discovery, sección "Verificación de fuentes".
**Riesgo si es falso o queda sin corregir**: el posicionamiento del archivo 01 se apoya en datos incorrectos.
**Cómo validar**: completar la tabla de verificación del informe y actualizar 01 y 10 si algo cambia.
