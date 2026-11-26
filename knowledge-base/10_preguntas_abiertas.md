# Preguntas Abiertas

## Inconsistencias detectadas

### IN-01: El change sugerido por la consigna menciona sillón, pero el MVP no tiene sillones
**La consigna dice**: "Crear un turno evitando solapamientos por profesional y por sillón/box".
**El Discovery dice**: segmento de odontólogo independiente, sin modelar sillón (DD-06).
**Impacto**: el change de la Etapa 6 no cubre la dimensión sillón.
**Resolución propuesta**: implementar "Crear turno evitando solapamientos del profesional" (US-030). Sigue siendo válido según la consigna, porque tiene reglas verificables y es chico. Justificarlo en `proposal.md`.

### IN-02: La política visual es "off" pero el MVP incluye frontend web (RESUELTA, DD-11: se mantiene "off")
**El plan de fundación dice**: `visual-design: off` (sin sistema de diseño ni mockups).
**La KB dice**: el MVP incluye un frontend web (DD-02, DD-09).
**Impacto**: las pantallas se construirán sin una guía visual acordada.
**Resolución propuesta**: mantener "off" para el TP (no se evalúa la UI) o cambiar la política con `/active-orchestrator design` antes del primer change de frontend.

### IN-03: El diferencial "WhatsApp automático" se convirtió en `wa.me` semiautomático
**El Discovery, ronda 1, dice**: el diferencial es "WhatsApp automático".
**La decisión final dice**: enlaces `wa.me`, que no usan API y no son automáticos (DD-05).
**Impacto**: el posicionamiento es más débil frente a AgendaPro, Simples Dental o Doctocliq.
**Resolución propuesta**: presentar el diferencial como "recordatorio incluido, sin costo por mensaje" y planificar la API como etapa 2.

### IN-04: Precios de competidores con moneda ambigua
**El informe dice**: DentalSoft publica "$30.000/mes" y "$60.000/mes", pero cita los costos de WhatsApp en USD. Medesk publica "$16/mes" sin moneda.
**Impacto**: no se puede comparar el precio objetivo (PA-04).
**Resolución propuesta**: verificar manualmente (tabla de verificación del informe).

## Preguntas abiertas de producto (priorizadas)

| ID | Prioridad | Pregunta | Bloquea | Decisor |
|---|---|---|---|---|
| PA-01 | ~~Alta~~ Resuelta | ¿Una cancelación tardía cuenta como ausencia? **No** (DD-10, RN-CA-04) | — | Usuario, 2026-11-24 |
| PA-02 | Media | ¿Se permiten sobreturnos explícitos que se salten RN-TU-01 con confirmación? | Etapa posterior | Producto |
| PA-03 | Media | ¿Se registra la obra social del paciente en el MVP? (Hoy es texto opcional.) | Alta de pacientes | Producto |
| PA-04 | Baja | ¿Cuál es el precio objetivo para el independiente? Referencia local: $13.900 a $60.000 por mes | Lanzamiento | Producto |
| PA-05 | ~~Media~~ Resuelta | ¿Un bloqueo sobre turnos activos se rechaza? **Sí, con la lista de conflictos** (DD-10, RN-AG-03) | — | Usuario, 2026-11-24 |
| PA-06 | ~~Media~~ Resuelta | ¿Reprogramar con poca anticipación cuenta como cancelación tardía? **No** (DD-10, RN-TU-09) | — | Usuario, 2026-11-24 |
| PA-07 | Baja | ¿Cuándo se suma una secretaria con acceso? | Etapa posterior | Producto |
| PA-08 | Media | ¿Qué requisitos formales de las leyes 25.326 y 26.529 se adoptan (registro de bases ante la AAIP, consentimiento)? | Producción | Equipo / asesoría |
| PA-09 | ~~Alta~~ Resuelta | Tecnología del frontend: **HTML + CSS + TypeScript sin framework** (DD-09) | — | Usuario, 2026-11-24 |
| PA-10 | ~~Media~~ Obsoleta | Versión de Spring Boot: ya no aplica (DD-12) | — | — |
| PA-12 | Alta | Node no chequea tipos. ¿Se acepta trabajar sin chequeo, o se admite `typescript` como **única** devDependency para correr `tsc --noEmit` en el CI? | `crear-turno-sin-solapamientos` (explore) | Equipo |
| PA-13 | ~~Alta~~ Resuelta | Node elimina los tipos con `node:module.stripTypeScriptTypes` y devuelve los módulos como JavaScript. Ver [diseño de C-17](../openspec/changes/archive/2026-11-25-pantalla-agenda-diaria/design.md). | `pantalla-agenda-diaria` | Maximiliano |
| PA-14 | Media | ¿Qué persistencia duradera se usa después del MVP: archivo JSON o `node:sqlite`? ¿Cómo se garantiza entonces RN-TU-10 si hay varios procesos? | Después del TP | Equipo técnico |
| PA-16 | Alta | La skill `node` (mcollina) indica que en Node 22.x TypeScript corre sin flag desde **22.19+**, y que antes hace falta `--experimental-strip-types`. La KB fija ≥ 22.18. ¿Se sube el mínimo a 22.19 o se agrega el flag a los scripts? Verificarlo con `node --version` en las máquinas del equipo | `crear-turno-sin-solapamientos` (explore) | Equipo |
| PA-15 | Media | La consigna admite grupos de hasta 3 integrantes y el equipo tiene 4. Confirmarlo con el docente | Entrega | Equipo |
| PA-11 | Media | ¿Sesión con cookie o token para el frontend web? (Dominio CRÍTICO.) | Change de acceso | Equipo técnico, con aprobación humana |

## Puntos "No evidenciado" del Discovery (pendientes de verificación)

| ID | Punto | Fuente | Acción |
|---|---|---|---|
| NE-01 | Doctoralia Pro: todas sus funcionalidades y precios | https://pro.doctoralia.com.ar/ (no accesible) | Abrir manualmente y completar el informe |
| NE-02 | XIAgenda: sitio oficial y funcionalidades | https://xiagenda.com/ (no accesible) | Ídem |
| NE-03 | Curve Dental: funcionalidades y precios | https://www.curvedental.com/ (no accesible) | Ídem |
| NE-04 | Moneda de los precios de DentalSoft | https://dentalsoft.com.ar/ | Verificar |
| NE-05 | Precios por plan de AgendaPro (la página /precios dio 404) | https://agendapro.com/ar | Verificar |
| NE-06 | Inscripción de MedicAI en ReNaPDiS N° 292 | Listado oficial en argentina.gob.ar | Verificar |
| NE-07 | Funcionalidades reales de Reservo (evidencia mínima) | https://reservo.cl/ | Verificar |
| NE-08 | Prevención de solapamientos en competidores: ningún sistema la demuestra (solo afirmaciones comerciales de DentalSoft y Simples Dental) | Informe A.2 | Confirmar en demos (D.1) |
| NE-09 | Periodontograma: No evidenciado en la mayoría | Informe A.3 | Solo relevante en etapas posteriores |
| NE-10 | Gesden y Dendoo: dominios incorrectos | Informe, fuentes no accesibles | Buscar el dominio correcto o descartar |
