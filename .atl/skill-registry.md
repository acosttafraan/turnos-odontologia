# Skill Registry

**Solo para el agente que delega.** Cualquier agente que lance sub-agentes lee este registro, resuelve las reglas compactas y las inyecta directamente en el prompt de cada sub-agente. Los sub-agentes NO leen este registro ni los SKILL.md individuales.

- **Proyecto**: turnos-odontologia
- **Generado**: 2026-11-24 (fase `registry` de la fundación)
- **Stack del proyecto**: TypeScript nativo en Node ≥ 22.18, sin dependencias. Ver `knowledge-base/02_descripcion_general.md`.

Directorios escaneados:
- `~/.claude/skills/`, que contiene enlaces a `~/.agents/skills/`.
- `turnos-odontologia/.claude/skills/`.

Los directorios de OpenCode, Gemini, Cursor y Copilot no existen en esta máquina. Se omiten `sdd-*`, `_shared` y `skill-registry`. Cuando una skill aparece en ambos niveles, gana la versión del proyecto.

## User Skills

### Relevantes para este proyecto (con reglas compactas)

| Trigger | Skill | Path |
|---|---|---|
| Implementar con tests primero, red-green, tests de integración | tdd | `~/.agents/skills/tdd/SKILL.md` |
| Node con TypeScript nativo (type stripping), `node:test`, errores, apagado ordenado | node | `~/.agents/skills/node/SKILL.md` |
| `opsx explore`: pensar o investigar antes o durante un change | openspec-explore | `turnos-odontologia/.claude/skills/openspec-explore/SKILL.md` |
| `opsx propose`: crear un change con proposal, design, specs y tasks | openspec-propose | `turnos-odontologia/.claude/skills/openspec-propose/SKILL.md` |
| `opsx apply`: implementar las tasks de un change | openspec-apply-change | `turnos-odontologia/.claude/skills/openspec-apply-change/SKILL.md` |
| `opsx archive`: archivar un change terminado | openspec-archive-change | `turnos-odontologia/.claude/skills/openspec-archive-change/SKILL.md` |
| `opsx sync`: pasar los delta specs a los specs principales | openspec-sync-specs | `turnos-odontologia/.claude/skills/openspec-sync-specs/SKILL.md` |
| `opsx update`: revisar los artefactos de un change | openspec-update-change | `turnos-odontologia/.claude/skills/openspec-update-change/SKILL.md` |
| Elegir ODD o SDD para una unidad de trabajo, fichas del equipo, entrega | active-delivery | `~/.claude/skills/active-delivery/SKILL.md` |

### Disponibles, sin reglas compactas (no aplican al código de este stack)

| Trigger | Skill | Path |
|---|---|---|
| Fundación del proyecto (init, kb, team, memory…) | active-orchestrator | `~/.claude/skills/active-orchestrator/SKILL.md` |
| Publicar o reconciliar CHANGES.md con ClickUp | active-roadmap | `~/.claude/skills/active-roadmap/SKILL.md` |
| Generar AGENTS.md / CLAUDE.md | agent-instruction | `~/.claude/skills/agent-instruction/SKILL.md` |
| Sistema de diseño del proyecto (la política visual del proyecto es "off") | design-system | `~/.claude/skills/design-system/SKILL.md` |
| Estética de frontend v1 | design-taste-frontend-v1 | `~/.claude/skills/design-taste-frontend-v1/SKILL.md` |
| Fase Discovery | discovery-research | `~/.claude/skills/discovery-research/SKILL.md` |
| Pulido de UI y animaciones | emil-design-eng | `~/.claude/skills/emil-design-eng/SKILL.md` |
| Buscar o instalar skills | find-skill | `~/.claude/skills/find-skill/SKILL.md` |
| Base de conocimiento | kb-creator | `~/.claude/skills/kb-creator/SKILL.md` |
| Generar CHANGES.md | roadmap-generator | `~/.claude/skills/roadmap-generator/SKILL.md` |
| Crear o mejorar skills | skill-creator | `~/.claude/skills/skill-creator/SKILL.md` |
| Investigar competidores a partir de una URL | web-scraper | `~/.claude/skills/web-scraper/SKILL.md` |

## Compact Rules

Son reglas ya digeridas para cada skill. El agente que delega copia los bloques que correspondan en el prompt del sub-agente, bajo el título `## Project Standards (auto-resolved)`.

### tdd
- El ciclo es rojo → verde: primero el test que falla y después solo el código mínimo para que pase. Nada especulativo.
- Se trabaja en cortes verticales: un test, una implementación, y se repite. Nunca todos los tests primero.
- Los tests verifican comportamiento a través de interfaces públicas ("seams"), nunca detalles internos ni métodos privados.
- Las seams se acuerdan con el usuario **antes** de escribir tests. En este proyecto son los casos de uso de `src/agenda/` y las rutas HTTP de `src/api/`.
- No escribir tests tautológicos. El valor esperado sale del spec o de un literal conocido, no de recalcularlo como lo hace el código.
- No mockear colaboradores internos. En este proyecto se usan los repos en memoria reales y un reloj fijo inyectado.
- El refactor no es parte del ciclo: va en la etapa de revisión.
- Regla del proyecto: el nombre de cada test incluye el código RN del escenario, por ejemplo `RN-TU-01: rechaza turno solapado`.

### node
- Se ejecuta TypeScript directo con `node archivo.ts`, sin ts-node, tsx ni build.
- Solo sintaxis borrable: usar `import type` para tipos, objetos `const` o uniones de literales en lugar de `enum`, y nada de `namespace`, parameter properties ni decoradores legacy.
- Los imports relativos llevan la extensión `.ts` (`import { x } from './x.ts'`). Se usa ESM con `"type": "module"`.
- Tests con el runner nativo: `node --test`, con `node:test` y `node:assert/strict`. Cada test tiene que ser aislado: sin estado compartido entre tests y cerrando servidores y handles en `after`.
- Errores con un `code` estable, por ejemplo `ReglaNegocioError.codigo`. Nunca tragar errores. Usar `cause` para encadenarlos.
- Registrar `process.on('unhandledRejection')` y un apagado ordenado ante SIGTERM/SIGINT: dejar de aceptar pedidos, drenar los que están en curso, cerrar el servidor y salir.
- Configuración solo por variables de entorno, validadas al arrancar. Nunca secretos en el código.
- **Diferencia con la KB**: la skill dice que en 22.x se ejecuta sin flag recién desde **22.19+** y que antes hay que usar `--experimental-strip-types`, mientras que la KB fija **≥ 22.18**. Ver PA-16 en `knowledge-base/10_preguntas_abiertas.md`.
- La skill sugiere `tsconfig` con `noEmit`, `allowImportingTsExtensions` y `verbatimModuleSyntax` para chequear tipos con `tsc`. Eso requiere la devDependency `typescript` (PA-12): **no agregarla sin decisión del equipo**.
- La skill menciona bibliotecas como `lru-cache` y `@fastify/create-error`: **no usarlas**, porque el proyecto no tiene dependencias (DD-12).

### openspec-explore
- Es modo de pensamiento: **nunca** se implementa código ni se editan `openspec/config.yaml`, schemas o templates.
- Antes de cualquier escritura, incluido `openspec new change`, se nombran los artefactos y se pide un sí/no explícito en un mensaje aparte.
- Nunca se crean directorios bajo `openspec/changes/` a mano: siempre con `openspec new change "<nombre>"`.
- Se explora el código real, se cuestionan los supuestos y se ofrecen diagramas.

### openspec-propose
- Requiere un nombre kebab-case de change. Usar los nombres de CHANGES.md: `crear-turno-sin-solapamientos`, `cancelar-turno-y-liberar-horario`, `reprogramar-turno` y `pantalla-agenda-diaria`.
- Si hay ambigüedad que afecte el alcance o el comportamiento observable, preguntar antes de crear el change.
- Primero `openspec context --json` y leer `openspec/config.yaml` (idioma `es`, encabezados y SHALL/MUST en inglés).
- Genera proposal, design, specs y tasks. Los escenarios van en formato dado/cuando/entonces, con al menos un caso feliz, un error de negocio y un borde.
- `proposal.md` justifica la elección del change en 2 o 3 líneas.

### openspec-apply-change
- Anunciar "Using change: <nombre>" y correr `openspec status --change "<nombre>" --json` antes de tocar código.
- Implementar **solo** lo que está en el spec aprobado. Si falta algo, se vuelve a propose o update; no se inventa en apply.
- Marcar cada task en `tasks.md` al completarla. Los tests de cada escenario tienen que pasar (`node --test`).

### openspec-archive-change
- Seleccionar el change activo y ejecutar `openspec instructions archive --change "<nombre>" --json` (es solo consultivo).
- No archivar con tests en rojo ni con tasks incompletas sin confirmación del usuario.

### openspec-sync-specs
- Ubicar los specs principales con `openspec status --change "<nombre>" --json` (`planningHome.root`) y nunca con rutas fijas.
- Aplica los delta specs del change a `openspec/specs/`.

### openspec-update-change
- Revisa los artefactos de un change existente y los mantiene coherentes entre sí. Nunca edita código.

### active-delivery
- Al empezar una unidad de trabajo se acuerda ODD o SDD con el usuario. Las fichas del TP están en `Modo: sdd`.
- En modo equipo se identifica al integrante (`.active-stack/me.local.json`) y se trabaja sobre sus fichas de CHANGES.md (`Responsable`).
- Cada PR usa la plantilla `.github/pull_request_template.md` con sus seis datos de traspaso: Ficha, Result, PR and SHA, How to verify, What is left, Who continues, What blocks it.

## Project Conventions

| Archivo | Path | Notas |
|---|---|---|
| AGENTS.md | `turnos-odontologia/AGENTS.md` | Índice: stack, KB, skills por rol, roadmap, reglas duras y reglas de equipo |
| CLAUDE.md | `turnos-odontologia/CLAUDE.md` | Copia idéntica de AGENTS.md |
| bitacora-inspeccion.md | `turnos-odontologia/docs/bitacora-inspeccion.md` | Referenciado por AGENTS.md: una línea por etapa |
| CHANGES.md | `turnos-odontologia/CHANGES.md` | Índice de changes, con responsables y dependencias |
| knowledge-base/ | `turnos-odontologia/knowledge-base/README.md` | Índice de los 10 archivos canónicos |
| CODEOWNERS | `turnos-odontologia/.github/CODEOWNERS` | Revisores: @acosttafraan (primario) y @Stefano-8senatore (respaldo) |

Las reglas del proyecto están en los archivos de convenciones de arriba. Todos los paths referenciados ya se extrajeron, así que no hace falta leer los índices para encontrar otros.

> Nota: `.atl/` **no** se agrega a `.gitignore`, aunque la skill lo sugiere, porque la consigna del TP exige versionar `.atl/skill-registry.md`.
