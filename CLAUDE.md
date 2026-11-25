<!-- active-stack:agent-instruction -->
# turnos-odontologia: Instrucciones para Agentes

> Todo agente lee este archivo (y su copia `CLAUDE.md`) antes que cualquier otra cosa al entrar al repo.
> Se generó a partir de `knowledge-base/` y `CHANGES.md`. No lo edites a mano sin volver a sincronizar los dos archivos.

Agenda de turnos para el **odontólogo independiente argentino**. Su núcleo son reglas de agenda verificables: sin solapamientos `[inicio, fin)`, dentro del horario de atención, fuera de bloqueos y con cancelación en término o tardía. El diferencial es el recordatorio por WhatsApp con `wa.me`, sin costo por mensaje.

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|------------|---------|
| Runtime | Node.js, que ejecuta TypeScript **de forma nativa** (elimina los tipos sin compilar) | ≥ 22.18 (ver PA-16) |
| Lenguaje | TypeScript con sintaxis **borrable** únicamente | — |
| Dependencias | **Ninguna** (ni `dependencies` ni `devDependencies`) | — |
| HTTP | `node:http` | — |
| Tests | `node:test` + `node:assert/strict` (`node --test`) | — |
| Persistencia (MVP) | Repositorios en memoria detrás de puertos | — |
| Seguridad | `node:crypto` (`scrypt`, HMAC) | — |
| Frontend | HTML + CSS + TypeScript servido por el mismo proceso Node | — |

Detalle completo: [knowledge-base/02_descripcion_general.md](knowledge-base/02_descripcion_general.md)

---

## Base de Conocimiento

La fuente de verdad del dominio vive en `knowledge-base/`. **Leé el archivo relevante ANTES de implementar.**

| Archivo | Cuándo leerlo |
|---------|---------------|
| [01_vision_y_objetivos.md](knowledge-base/01_vision_y_objetivos.md) | Para entender el propósito, el alcance del MVP y el posicionamiento |
| [03_actores_y_roles.md](knowledge-base/03_actores_y_roles.md) | Al trabajar en acceso y permisos (dominio CRÍTICO) |
| [04_modelo_de_datos.md](knowledge-base/04_modelo_de_datos.md) | Para conocer los tipos TS de las entidades y los datos semilla ficticios |
| [05_reglas_de_negocio.md](knowledge-base/05_reglas_de_negocio.md) | Para las reglas codificadas RN-XX, sobre todo **RN-TU** |
| [06_funcionalidades.md](knowledge-base/06_funcionalidades.md) | Para las historias de usuario y sus criterios de aceptación |
| [07_flujos_principales.md](knowledge-base/07_flujos_principales.md) | Para los flujos de crear, cancelar y reprogramar turnos y el recordatorio |
| [08_arquitectura_propuesta.md](knowledge-base/08_arquitectura_propuesta.md) | Para patrones, directorios, tests, seguridad y variables de entorno |
| [09_decisiones_y_supuestos.md](knowledge-base/09_decisiones_y_supuestos.md) | Para las decisiones DD-01 a DD-17 (DD-01 y DD-03 están reemplazadas) |
| [10_preguntas_abiertas.md](knowledge-base/10_preguntas_abiertas.md) | ⚠️ Inconsistencias que hay que resolver ANTES de escribir código |

> ⚠️ Resolver las preguntas de prioridad **Alta** de `10_preguntas_abiertas.md` antes de arrancar el change que bloquean:
> - **PA-12** (chequeo de tipos) y **PA-16** (versión mínima de Node / flag): en el explore de `crear-turno-sin-solapamientos`.
> - **PA-13** (cómo llega el TypeScript al navegador): antes de `pantalla-agenda-diaria`.

---

## Skills Disponibles

| Agente | Rol | Skills que carga |
|--------|-----|------------------|
| **Backend de dominio** | Reglas de agenda en `src/agenda/`, rutas en `src/api/` | `node`, `tdd` |
| **Frontend** | `src/web/` (HTML + CSS + TS) | `node` (TypeScript nativo), `tdd` (funciones puras de presentación) |
| **Ciclo OPSX** | Explore → propose → apply → verify → archive de cada change | `openspec-explore`, `openspec-propose`, `openspec-apply-change`, `openspec-archive-change`, `openspec-sync-specs`, `openspec-update-change` |
| **Entrega en equipo** | Identificar a la persona, sus fichas y el handoff | `active-delivery` |
| **Fundación** | Contexto e instrucciones | `active-orchestrator`, `kb-creator`, `roadmap-generator`, `agent-instruction`, `skill-registry` |

Cargá la skill que corresponda al contexto ANTES de escribir código.

> El orquestador resuelve las reglas compactas de cada skill desde [.atl/skill-registry.md](.atl/skill-registry.md), que genera `skill-registry`. En este proyecto el registro **sí** se versiona, porque lo exige la consigna. Esta tabla solo mapea cada skill a su rol.

---

## Roadmap de Changes

El plan completo está en [CHANGES.md](CHANGES.md). Resumen:

- **Alcance del TP**: **un change por integrante**, cuatro en total (DD-17). Los otros 12 son backlog posterior. Retirados: C-01, C-02, C-09 y C-19.
  - `crear-turno-sin-solapamientos`: Francisco. Incluye el proyecto base y el README inicial.
  - `cancelar-turno-y-liberar-horario`: Stefano.
  - `reprogramar-turno`: Martina.
  - `pantalla-agenda-diaria`: Maximiliano.
- **Camino crítico del TP** (2 pasos): `crear-turno-sin-solapamientos → (cancelar-turno-y-liberar-horario | reprogramar-turno | pantalla-agenda-diaria)`.
- **Primer change**: `crear-turno-sin-solapamientos` (C-07). Es el cuello de botella: mientras se mergea, los otros tres hacen explore y propose. Cada PR suma su sección "Cómo probar" al `README.md`.

**Antes de iniciar un item**: leé [CHANGES.md](CHANGES.md) e identificá sus dependencias (`Depende de`), su `Zona` y los archivos de "Leer antes". Los changes se nombran por su nombre, no solo por el ID.

---

## Reglas Duras (específicas del proyecto)

> Reglas **globales** ya definidas en el archivo global de instrucciones del cliente activo (orquestador OPSX y CLI `openspec`, governance por dominio, Engram, diagramas, gate de diseño): el proyecto las **hereda** y no se repiten acá. Acá viven solo las reglas **específicas de este proyecto** y las universales que el global no cubre.

Son contrato: romperlas es un defecto.

**Stack**
- NUNCA agregar dependencias npm (ni de runtime ni de desarrollo) → usar la biblioteca estándar de Node. Solo se admite una excepción si queda registrada como decisión en la KB (ver PA-12).
- NUNCA usar sintaxis TypeScript no borrable (`enum`, `namespace`, parameter properties, decoradores) → usar uniones de literales u objetos `const`, `import type` para tipos e imports relativos con extensión `.ts`.
- NUNCA usar `any` → usar `unknown` y validar en el borde (`src/api/`) antes de llamar al dominio.
- NUNCA importar `node:http` ni `src/infra/` desde `src/agenda/`, ni usar `new Date()` dentro del dominio → el dominio es puro, depende de puertos y recibe el reloj inyectado.
- NUNCA poner un `await` entre verificar el solapamiento y guardar el turno → ese tramo es síncrono, y así se cumple RN-TU-10 (concurrencia).
- NUNCA comparar fechas como texto ni depender de la zona horaria del servidor → usar ISO 8601 con offset, comparar en milisegundos y trabajar en `America/Argentina/Buenos_Aires` (RN-CF-01).

**Dominio y datos**
- NUNCA almacenar datos reales de pacientes en el repositorio, ejemplos, seeds, tests, capturas ni commits → usar solo datos ficticios (DNI de prueba `0000000X`, teléfonos de ejemplo). *Regla propia del dominio, RN-DA-01.*
- NUNCA exponer la API fuera de `127.0.0.1` ni cargar datos reales antes de que exista `acceso-autenticacion` → API local y datos ficticios (DD-15).
- NUNCA loguear DNI, teléfono ni contenido de mensajes → los logs no llevan datos personales (RN-DA-03).

**Proceso**
- NUNCA pedirle al agente un commit sin tener configurados `git config user.name` y `git config user.email` propios → cada integrante commitea con su propia identidad, para que la participación individual se pueda demostrar.
- NUNCA entrar a `master` sin PR → a `master` solo se entra por un PR revisado por el líder. Los PR del líder los revisa el revisor de respaldo (ver `.github/CODEOWNERS`). La rama principal se llama **`master`**: donde las reglas de equipo dicen `main`, léase `master`.
- NUNCA cerrar una etapa sin registrarla → al terminar cada etapa, agregar una línea en [docs/bitacora-inspeccion.md](docs/bitacora-inspeccion.md) con el formato `Etapa | Decisión (Continuar/Ajustar/Parar) | Qué estaba mal | Qué se corrigió`.

---

## Flujo de Trabajo

```
1. Leer la KB relevante (knowledge-base/)              → entender el dominio y las reglas RN
2. Identificar el change en CHANGES.md                 → respetar Depende de, Zona y Responsable
3. Acordar alcance y criterios de aceptación (OPSX)    → explore → propose (escenarios dado/cuando/entonces)
4. Implementar y verificar (apply → verify)            → node --test en verde
5. PR con la plantilla, revisión y archive             → marcar [x] en CHANGES.md y anotar la bitácora
```

Aplicá TODAS las reglas duras en cada paso. Si la KB y este archivo se contradicen, prevalecen las reglas duras.
<!-- /active-stack:agent-instruction -->

<!-- active-stack:team-mode -->
## Reglas de equipo

Proyecto de equipo: la configuración vive en `.active-stack/team.json`.

- Al iniciar la sesión, si existe `.active-stack/team.json`, usá la skill `active-delivery` para identificar a la persona y mostrar «qué me toca». Detalle en las `references/` de esa skill.
- Una rama y un worktree por ficha: `<id>-slug`. Nunca dos agentes en la misma rama o carpeta.
- Nada directo a `main`. PR chicos. Commit, push y PR solo con autorización de la persona.
- No inventes nombres ni cuentas de integrantes: lo que falte queda pendiente hasta que el equipo lo complete.

**Si la skill `active-delivery` no está disponible en este cliente**, aplicá la misma convención a mano:

1. Una rama por ficha (`<id>-slug`) creada desde la rama principal actualizada.
2. Todo cambio entra por pull request; sin push a `main` ni force-push.
3. Al terminar, dejá el handoff en `knowledge-base/entrega/<id>.md`: qué se hizo, cómo se verificó, qué sigue y qué decisiones quedan abiertas.
<!-- /active-stack:team-mode -->
