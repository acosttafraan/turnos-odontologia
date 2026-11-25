# CHANGES: Secuencia de Implementación

> Índice canónico de los changes del proyecto **turnos-odontologia**, una agenda de turnos para el odontólogo independiente.
> Stack: **TypeScript nativo en Node ≥ 22.18, sin dependencias** (DD-12).
> Cada change es atómico: un agente o una persona puede implementarlo en una sesión de unas 4 a 6 horas.
> **Leer este archivo antes de empezar un item.**
>
> **Modo equipo activo** (`.active-stack/team.json`): Francisco Acosta (líder), Stefano Senatore, Martina Vergara y Maximiliano Moreno.
> Cada integrante conduce el ciclo OPSX completo de **su** change (DD-16).
> **Alcance del TP: exactamente un change por integrante** (DD-17, por falta de tiempo). Todo lo demás es backlog posterior.

---

## Cómo usar este documento

1. **Identificá tu item**: buscá tu nombre en `Responsable`. Si no tenés item asignado, elegí uno con estado `[ ]` cuyas dependencias (`Depende de`) estén todas en `[x]`.
2. **Verificá dependencias y leé la KB**: abrí cada archivo de "Leer antes". Las reglas se citan por código RN-XX, definido en `knowledge-base/05_reglas_de_negocio.md`.
3. **Acordá alcance y verificación**: los items `Modo: sdd` siguen el ciclo OPSX (`/opsx` explore → propose → apply → verify → archive) en una rama propia, con el nombre del change.
4. **Verificá el resultado**: cada escenario del spec tiene un test en `tests/`, con el código RN en el nombre. `node --test` debe quedar en verde.
5. **Actualizá el estado**: abrí el PR con la plantilla de `.github/pull_request_template.md` y marcá el item `[x]` en este archivo dentro del mismo PR. Francisco revisa y hace el merge a `master`. Los PR de Francisco los revisa Stefano.

---

## Árbol de dependencias

```
crear-turno-sin-solapamientos (C-07)                      ← Francisco (incluye el proyecto base y el README inicial)
├── cancelar-turno-y-liberar-horario (C-10)               ← Stefano
├── reprogramar-turno (C-11)                              ← Martina
├── pantalla-agenda-diaria (C-17)                         ← Maximiliano
│
├── [backlog] registrar-asistencia (C-12)
├── [backlog] recordatorio-whatsapp-wame (C-13)
├── [backlog] persistencia-duradera (C-20)
└── [backlog] acceso-autenticacion (C-03)                 (CRITICO, obligatorio antes de datos reales)
    └── [backlog] configuracion-consultorio-y-horarios (C-04)
        ├── [backlog] catalogo-prestaciones (C-05)
        ├── [backlog] gestion-pacientes (C-06)
        └── [backlog] bloqueos-de-agenda (C-08)

[backlog] frontend-login-y-layout (C-14)        ← C-03, C-17
[backlog] frontend-configuracion (C-15)         ← C-14, C-04, C-05, C-08
[backlog] frontend-pacientes (C-16)             ← C-14, C-06
[backlog] frontend-acciones-de-turno (C-18)     ← C-17, C-10, C-11, C-12, C-13

Retirados:
  C-01 → absorbido por crear-turno-sin-solapamientos (proyecto base)
  C-02 → absorbido por pantalla-agenda-diaria
  C-09 → absorbido por crear-turno-sin-solapamientos
  C-19 → repartido: README inicial en crear-turno; cada change suma su sección
```

### Paralelismo por fase

```
GATE 0: (inicio)
  → C-07 crear-turno-sin-solapamientos             [Francisco]   ← cuello de botella: mergearlo cuanto antes
  → explore + propose de C-10, C-11 y C-17          [Stefano, Martina, Maximiliano]   (los specs no necesitan código)

GATE 1: crear-turno-sin-solapamientos ✓ (mergeado en master)   ← FORK (3 ciclos en paralelo)
  → C-10 cancelar-turno-y-liberar-horario  apply → verify → archive   [Stefano]
  → C-11 reprogramar-turno                 apply → verify → archive   [Martina]
  → C-17 pantalla-agenda-diaria            apply → verify → archive   [Maximiliano]

Backlog posterior al TP (sin responsable):
  GATE B1: C-07 ✓               → C-03 acceso-autenticacion
  GATE B2: C-03 ✓               → C-04 configuracion-consultorio-y-horarios
  GATE B3: C-04 ✓, C-07 ✓       → C-05, C-06, C-08 (en paralelo)       ← FORK
  GATE B4: C-07 ✓               → C-12, C-13, C-20 (en paralelo)       ← FORK
  GATE B5: C-03 ✓, C-17 ✓       → C-14 → C-15 (si C-04, C-05, C-08 ✓) y C-16 (si C-06 ✓)
  GATE B6: C-12, C-13 ✓         → C-18
```

### Camino crítico (2 pasos, mínimo irreducible para la entrega del TP)

```
crear-turno-sin-solapamientos → (cancelar-turno-y-liberar-horario | reprogramar-turno | pantalla-agenda-diaria)*
```

\* Los tres changes del paso 2 corren en paralelo. Cualquiera puede ser el último en cerrar.

Para el **MVP completo** (producción, después del TP), el camino más largo es `C-07 → C-17 → C-14 → C-15` o `C-07 → C-03 → C-04 → C-08 → C-15`.

### Plan óptimo con 3 agentes

Adaptado a un equipo de 4 personas con **un change cada uno**: cada columna es un integrante con su rama.

| Paso | Francisco (líder) | Stefano | Martina | Maximiliano (frontend) |
|---|---|---|---|---|
| 1 | `crear-turno-sin-solapamientos`: explore, propose y apply del proyecto base + dominio + API mínima | explore + propose de `cancelar-turno-y-liberar-horario` | explore + propose de `reprogramar-turno`; además cierra la verificación de fuentes y el PDF del Discovery | explore + propose de `pantalla-agenda-diaria` (decide PA-13); maqueta estática |
| 2 | verify + archive, **PR revisado por Stefano**, merge a `master` | revisa el PR de Francisco | revisa los specs del dominio | — |
| 3 | revisa y mergea los PR de los demás | apply → verify → archive | apply → verify → archive | apply → verify → archive |

Ramas, con la convención `<id>-slug` de las reglas de equipo: `C-07-crear-turno-sin-solapamientos`, `C-10-cancelar-turno-y-liberar-horario`, `C-11-reprogramar-turno`, `C-17-pantalla-agenda-diaria`. La rama principal es `master`.

**README**: lo crea `crear-turno-sin-solapamientos` (requisitos, cómo correr la app y `node --test`). Cada uno de los otros tres PR le agrega su sección "Cómo probar". Así el repo se puede reproducir siguiendo solo el README, que es lo que exige la consigna, sin un change aparte.

### Alineación con el MVP (Discovery, informe sección D.3)

| Funcionalidad imprescindible (D.3) | Change | Situación |
|---|---|---|
| Consultar disponibilidad por prestación y reservar sin solapamientos | `crear-turno-sin-solapamientos` | TP, Francisco |
| Cancelar liberando el horario | `cancelar-turno-y-liberar-horario` | TP, Stefano |
| Reprogramar | `reprogramar-turno` | TP, Martina |
| Vista diaria | `pantalla-agenda-diaria` | TP, Maximiliano |
| Horario de atención y anticipación configurables | `configuracion-consultorio-y-horarios` | Backlog (en el TP, viene de la semilla) |
| Prestaciones con duración | `catalogo-prestaciones` | Backlog (en el TP, viene de la semilla) |
| Alta básica de pacientes | `gestion-pacientes` | Backlog (en el TP, viene de la semilla) |
| Bloqueos de agenda | `bloqueos-de-agenda` | Backlog (en el TP, RN-TU-03 se valida contra bloqueos de la semilla) |
| Registro de asistencia | `registrar-asistencia` | Backlog |
| **Diferenciador**: recordatorio WhatsApp `wa.me` | `recordatorio-whatsapp-wame` | Backlog |
| Vista semanal | `frontend-acciones-de-turno` / extensión de `pantalla-agenda-diaria` | Backlog |

**Excluido a propósito**: nada de lo que D.3 dejó para etapas posteriores tiene change. Eso incluye la publicación del turnero online y su pantalla pública, WhatsApp Business API, Mercado Pago, ARCA, obras sociales, odontograma, varios profesionales o sillones, lista de espera, sobreturnos y reportes. C-07 cubre el flujo de reserva mediante la API local con datos ficticios.

**Habilitantes fuera de D.3**:
- `acceso-autenticacion`: obligatorio antes de usar datos reales (DD-15).
- `persistencia-duradera` (PA-14).
- README reproducible (exigido por la consigna): ya no es un change aparte, lo crea `crear-turno-sin-solapamientos` y lo completan los otros tres.

### Riesgos del roadmap

| Riesgo | Changes | Mitigación |
|---|---|---|
| `crear-turno-sin-solapamientos` bloquea a los otros tres, y además ahora incluye el proyecto base | C-07 | Es la única tarea de Francisco y su primera prioridad. Incluye tipos, `transicionarEstado`, puertos y semilla, además de `GET /api/v1/disponibilidad`, `POST /api/v1/turnos` y `GET /api/v1/turnos?fecha=`. Mientras tanto, los otros tres hacen explore y propose |
| Poco tiempo de entrega | Todos | Un solo change por persona (DD-17). Nada del backlog entra al TP |
| Conflictos de merge en `src/agenda/` (tipos `Turno` y transiciones de estado) | C-07, C-10, C-11 | C-07 define `transicionarEstado` (RN-TU-08) y el puerto del repositorio. Cancelar y reprogramar solo **agregan** archivos nuevos (`cancelar-turno.ts`, `reprogramar-turno.ts`) |
| Reprogramar necesita "cancelar en término" el turno original sin depender de C-10 | C-11 | Usa `transicionarEstado(turno, 'CANCELADO', { tipo: 'EN_TERMINO' })` de C-07, no el caso de uso de Stefano |
| Sin chequeo de tipos (Node solo elimina tipos) | Todos | Decidir PA-12 en el explore de `crear-turno-sin-solapamientos`. Los tests cubren el comportamiento |
| El navegador no ejecuta TypeScript | C-17 | Maximiliano decide PA-13 en su explore |
| API sin autenticación durante el TP | Todos | DD-15: solo `127.0.0.1`, solo datos ficticios. `acceso-autenticacion` es obligatorio antes de producción |
| Grupo de 4 cuando la consigna admite hasta 3 | Entrega | PA-15: confirmarlo con el docente |

---

## FASE 0: Base

### [C-01] `scaffolding-node-typescript`
- **Estado**: `[-]` retirado (DD-17). Su alcance (package.json, servidor `node:http`, router, traductor de errores, reloj, `node --test`) pasa a `crear-turno-sin-solapamientos` (C-07), para que cada integrante tenga un solo change.

### [C-02] `frontend-scaffolding`
- **Estado**: `[-]` retirado. Lo absorbe `pantalla-agenda-diaria` (C-17): con un solo proceso Node, servir `src/web/` es parte de esa pantalla.

---

## FASE 1: Ciclos OPSX del TP (un change por integrante)

> `crear-turno-sin-solapamientos` va primero. Cuando se mergea, los otros tres arrancan en paralelo.

### [C-07] `crear-turno-sin-solapamientos`
- **Estado**: `[ ]` pendiente
- **Resultado**: siguiendo el `README.md`, `node src/main.ts` levanta la API local. El paciente consulta horarios por fecha y prestación con `GET /api/v1/disponibilidad` y confirma con `POST /api/v1/turnos`. El POST vuelve a validar el horario y crea un turno `RESERVADO` o rechaza con 409/422 y el código RN cuando corresponda. `GET /api/v1/turnos?fecha=` lista la agenda del día. `node --test` está en verde con un test por escenario del spec.
- **Depende de**: ninguna
- **Zona**: package.json, README.md, .env.example, src/main.ts, src/agenda/, src/infra/, src/api/, tests/agenda/, tests/api/, openspec/
- **Requiere**: claude o codex · node >= 22.18 · windows y linux
- **Modo**: sdd
- **Responsable**: francisco
- **Governance**: MEDIO
- **Scope**:
  - **Proyecto base** (absorbe a C-01):
    - `package.json` con `"type": "module"`, `"engines"` según PA-16 y los scripts `start` (`node src/main.ts`) y `test` (`node --test`), **sin dependencias**.
    - `src/main.ts`: servidor `node:http` en `127.0.0.1:3000`.
    - `src/api/router.ts`: router mínimo con lectura del cuerpo JSON y límite de tamaño.
    - `src/api/errores.ts`: traduce `ReglaNegocioError` a 409/422 con `{ codigo, mensaje, detalle }`.
    - `src/agenda/reloj.ts`: el reloj inyectable.
    - `GET /api/v1/health`, `.env.example` sin secretos.
  - **README inicial** (absorbe una parte de C-19): requisitos (Node, sin `npm install`), cómo levantar la app, consultar disponibilidad, confirmar una reserva, listar la agenda diaria y correr `node --test`. Deja una sección "Cómo probar cada change" que completan los demás.
  - `design.md` registra PA-12 (cero dependencias y verificación con `node --test`) y PA-16 (Node 22.18.0 o superior sin flag).
  - `src/agenda/tipos.ts`: tipos `Turno`, `EstadoTurno`, `TipoCancelacion`, `FranjaHorario`, `Bloqueo`, `Prestacion`, `Paciente` (uniones de literales, sin `enum`).
  - `src/agenda/intervalo.ts`: `Intervalo` semiabierto `[inicio, fin)` y `seSuperponen(a, b)` (DD-07).
  - `src/agenda/estado.ts`: `transicionarEstado(turno, destino, opciones?)` según RN-TU-08. Lo **reutilizan** cancelar y reprogramar.
  - `src/agenda/puertos.ts`: `TurnosRepo` (`listarActivosEntre`, `listarPorFecha`, `guardar`, `obtener`), `HorariosRepo`, `BloqueosRepo`, `PrestacionesRepo`, `PacientesRepo`.
  - `src/agenda/crear-turno.ts`: valida en este orden:
    1. RN-TU-07: el paciente existe y la prestación está activa.
    2. RN-TU-04: no se puede crear en el pasado.
    3. RN-TU-05 y RN-TU-06: toma la duración configurada para la prestación y calcula el fin. El paciente solo elige prestación y horario.
    4. RN-TU-02: entra en una sola franja. El inicio debe corresponder a un horario generado para la prestación.
    5. RN-TU-03: no choca con bloqueos.
    6. RN-TU-01: no se superpone con turnos activos.

    Después **guarda sin ningún `await` entre la verificación y el guardado** (RN-TU-10).
  - `src/infra/memoria.ts` y `src/infra/semilla.ts` usan repositorios `Map` y una configuración ficticia precargada. La demo tiene un consultorio, una franja de 08:00 a 16:00 por día hábil, «Consulta general» de 20 minutos, tres pacientes y un bloqueo de ejemplo.
  - `GET /api/v1/disponibilidad?fecha=AAAA-MM-DD&prestacionId=...` devuelve los intervalos futuros que caben en una franja, en pasos de la duración de la prestación desde la apertura y sin solaparse con turnos activos o bloqueos. En un día libre, «Consulta general» ofrece de 08:00 a 15:40.
  - `src/api/turnos.ts` confirma con `POST /api/v1/turnos` y responde 201, 409 o 422. Si el horario ya está ocupado indica elegir otro. `GET /api/v1/turnos?fecha=AAAA-MM-DD` devuelve la agenda diaria ordenada por inicio, con paciente, prestación y estado.
  - El panel de configuración del odontólogo y la pantalla pública de reserva quedan para cambios posteriores.
  - Tests mínimos, uno por escenario y con el código RN en el nombre cuando corresponda:
    - caso feliz;
    - **solapamiento** → `RN-TU-01`;
    - **borde**: un turno que empieza exactamente cuando termina otro es válido;
    - cruza el corte entre franjas → `RN-TU-02`;
    - choca con un bloqueo → `RN-TU-03`;
    - en el pasado → `RN-TU-04`;
    - un turno cancelado no bloquea;
    - prestación inactiva → `RN-TU-07`;
    - disponibilidad por prestación en intervalos de 20 minutos, filtrando turnos activos y bloqueos;
    - **cierre de la franja**: 15:40 se acepta con fin a las 16:00 y una reserva que pasaría de las 16:00 se rechaza;
    - **dos pacientes intentan reservar el mismo horario**: un 201, un 409 con indicación de elegir otro horario y una sola reserva guardada.
  - `proposal.md` justifica la elección y que la regla es solo por profesional (IN-01).
- **Leer antes**:
  - `knowledge-base/05_reglas_de_negocio.md` §RN-TU
  - `knowledge-base/07_flujos_principales.md` §F-02 para el caso de uso de alta. El spec de C-07 define el contrato de reserva del paciente.
  - `knowledge-base/06_funcionalidades.md` §US-030, §US-031
  - `knowledge-base/04_modelo_de_datos.md` §Turno. La configuración de demo para C-07 es la indicada en esta ficha.
  - `knowledge-base/10_preguntas_abiertas.md` §IN-01

### [C-09] `turnos-api-y-persistencia`
- **Estado**: `[-]` retirado. La API pasa a `crear-turno-sin-solapamientos` (C-07) y la persistencia duradera a `persistencia-duradera` (C-20).

### [C-10] `cancelar-turno-y-liberar-horario`
- **Estado**: `[ ]` pendiente
- **Resultado**: `POST /api/v1/turnos/{id}/cancelar` deja el turno `CANCELADO` (`EN_TERMINO` o `TARDIA`) y el horario queda libre para un turno nuevo. Los tests de cada escenario están en verde.
- **Depende de**: C-07
- **Zona**: src/agenda/cancelar-turno.ts, src/api/turnos.ts, tests/agenda/, tests/api/, openspec/
- **Requiere**: claude o codex · node >= 22.18 · windows y linux
- **Modo**: sdd
- **Responsable**: stefano
- **Governance**: MEDIO
- **Scope**:
  - `src/agenda/cancelar-turno.ts`:
    - RN-CA-03: solo turnos activos que todavía no empezaron.
    - RN-CA-01: compara la anticipación con `anticipacionCancelacionHoras` de la semilla (24 h). Si es mayor o igual, `EN_TERMINO`; si es menor, `TARDIA`.
    - RN-CA-04: una cancelación tardía nunca pasa a `AUSENTE`.
    - Usa `transicionarEstado` de C-07.
  - Ruta `POST /api/v1/turnos/{id}/cancelar` → 200 (con `tipoCancelacion`), 404 o 422.
  - Tests mínimos:
    - **caso feliz**: anticipación de 48 h → `EN_TERMINO`;
    - **borde**: exactamente 24 h → `EN_TERMINO`, y 23 h 59 min → `TARDIA`;
    - **error de negocio**: turno ya empezado o en estado final → 422 `RN-CA-03`;
    - **libera el horario**: después de cancelar, `crearTurno` acepta un turno en el mismo intervalo (RN-CA-02).
  - `README.md`: agregar la sección "Cómo probar: cancelar un turno".
- **Leer antes**:
  - `knowledge-base/05_reglas_de_negocio.md` §RN-CA, §RN-TU-08
  - `knowledge-base/07_flujos_principales.md` §F-04
  - `knowledge-base/06_funcionalidades.md` §US-033
  - `knowledge-base/09_decisiones_y_supuestos.md` §DD-10

### [C-11] `reprogramar-turno`
- **Estado**: `[ ]` pendiente
- **Resultado**: `PUT /api/v1/turnos/{id}/reprogramar` crea el turno nuevo enlazado (`reprogramadoDesdeId`) y cancela el original en término, o rechaza sin modificar nada. Los tests de cada escenario están en verde.
- **Depende de**: C-07
- **Zona**: src/agenda/reprogramar-turno.ts, src/api/turnos.ts, tests/agenda/, tests/api/, openspec/
- **Requiere**: claude o codex · node >= 22.18 · windows y linux
- **Modo**: sdd
- **Responsable**: martina
- **Governance**: MEDIO
- **Scope**:
  - `src/agenda/reprogramar-turno.ts` (RN-TU-09):
    - Valida el destino con las mismas reglas que `crearTurno`, **excluyendo el turno original** del chequeo de solapamiento.
    - Si todo es válido, en el mismo tramo síncrono: el original pasa a `CANCELADO` / `EN_TERMINO` (**nunca** `TARDIA`, DD-10) con `transicionarEstado`, y se guarda el nuevo con `reprogramadoDesdeId`.
    - Si algo falla, no se modifica nada.
  - Ruta `PUT /api/v1/turnos/{id}/reprogramar` con `{ inicio, duracionMinutos? }` → 200 (turno nuevo), 404, 409 o 422.
  - Tests mínimos:
    - **caso feliz**: mover a un horario libre;
    - **borde**: mover 15 minutos de modo que el destino solo se superpone con el propio turno → válido;
    - **error de negocio**: destino que choca con otro turno → 409 `RN-TU-01` y el original sigue intacto;
    - reprogramar con menos de 24 h → el original queda `EN_TERMINO`.
  - `README.md`: agregar la sección "Cómo probar: reprogramar un turno".
- **Leer antes**:
  - `knowledge-base/05_reglas_de_negocio.md` §RN-TU-09, §RN-TU-08
  - `knowledge-base/07_flujos_principales.md` §F-03
  - `knowledge-base/06_funcionalidades.md` §US-032
  - `knowledge-base/09_decisiones_y_supuestos.md` §DD-08, §DD-10

### [C-17] `pantalla-agenda-diaria`
- **Estado**: `[ ]` pendiente
- **Resultado**: en `http://127.0.0.1:3000/agenda.html` se ve la agenda de un día: franjas de atención, bloqueos y turnos con paciente, prestación y estado. Se navega a los días anterior y siguiente. Las funciones de presentación tienen tests en verde.
- **Depende de**: C-07
- **Zona**: src/web/, src/api/estaticos.ts, tests/web/, openspec/
- **Requiere**: claude o codex · node >= 22.18 · navegador · windows y linux
- **Modo**: sdd
- **Responsable**: maximiliano
- **Governance**: BAJO
- **Scope**:
  - Decidir **PA-13** en el explore: el servidor elimina los tipos de `src/web/*.ts` antes de servirlos, o el frontend se escribe en JavaScript con JSDoc. Registrar la decisión en `design.md`.
  - `src/api/estaticos.ts`: sirve `src/web/` (HTML, CSS, JS/TS) con el `Content-Type` correcto y sin salir del directorio (protección contra *path traversal*).
  - `src/web/agenda.html`, `agenda.css`, `agenda.ts`:
    - consulta `GET /api/v1/turnos?fecha=`;
    - dibuja las franjas, los bloqueos sombreados y los turnos ordenados;
    - navega día anterior / siguiente / hoy;
    - muestra un mensaje si no hay turnos y los errores con su código RN.
  - Funciones puras testeables, en `src/web/agenda-vista.ts`: armar las filas del día y formatear las horas en `America/Argentina/Buenos_Aires`.
  - Tests mínimos:
    - **caso feliz**: arma las filas de un día con dos turnos;
    - **borde**: dos turnos consecutivos (uno termina cuando empieza el otro) se muestran sin superponerse;
    - **día sin atención**: muestra "Sin atención".
  - Accesibilidad básica: tabla o lista semántica y `role="alert"` para los errores.
  - `README.md`: agregar la sección "Cómo probar: ver la agenda diaria".
- **Leer antes**:
  - `knowledge-base/06_funcionalidades.md` §US-031, §US-060
  - `knowledge-base/08_arquitectura_propuesta.md` §Estructura de directorios, §Estrategia de tests
  - `knowledge-base/09_decisiones_y_supuestos.md` §DD-09, §DD-11, §DD-12
  - `knowledge-base/10_preguntas_abiertas.md` §PA-13

---

## FASE 2: Entrega del TP

### [C-19] `readme-y-entrega`
- **Estado**: `[-]` retirado (DD-17). El README lo crea `crear-turno-sin-solapamientos` y cada change le suma su sección "Cómo probar". Antes de entregar, el líder hace una prueba final en un clon limpio, siguiendo solo el README, y revisa que no haya secretos ni datos reales (RN-DA-01). Esa prueba es un control de entrega, no un change.

---

## FASE 3: Backlog posterior al TP (sin responsable)

### [C-03] `acceso-autenticacion`
- **Estado**: `[ ]` pendiente
- **Resultado**: toda ruta `/api/v1/**` excepto `login` y `health` responde 401 sin sesión, y el login emite una cookie de sesión firmada.
- **Depende de**: C-07
- **Zona**: src/acceso/, src/api/, tests/
- **Requiere**: claude o codex · node >= 22.18
- **Modo**: sdd
- **Scope**:
  - Usuario con contraseña hasheada con `crypto.scrypt` y sal.
  - `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`.
  - Cookie `HttpOnly`, `SameSite=Strict`, firmada con HMAC (`SESSION_SECRET`).
  - Middleware de protección. Login inválido → 401 genérico.
  - **Requiere aprobación humana explícita** (dominio CRÍTICO).
- **Governance**: CRITICO
- **Leer antes**: `knowledge-base/03_actores_y_roles.md`, `knowledge-base/08_arquitectura_propuesta.md` §Seguridad, `knowledge-base/09_decisiones_y_supuestos.md` §DD-15

### [C-04] `configuracion-consultorio-y-horarios`
- **Estado**: `[ ]` pendiente
- **Resultado**: `GET/PUT /consultorio` y `GET/PUT /consultorio/horarios` validan RN-CF-02 y RN-AG-01 y reemplazan los datos de la semilla.
- **Depende de**: C-03
- **Zona**: src/configuracion/, src/api/, tests/
- **Requiere**: claude o codex · node >= 22.18
- **Modo**: sdd
- **Governance**: MEDIO
- **Leer antes**: `knowledge-base/05_reglas_de_negocio.md` §RN-CF, §RN-AG, `knowledge-base/06_funcionalidades.md` §US-010, §US-011

### [C-05] `catalogo-prestaciones`
- **Estado**: `[ ]` pendiente
- **Resultado**: CRUD de prestaciones con RN-PR-01 y RN-PR-02 (se desactivan, no se borran).
- **Depende de**: C-04
- **Zona**: src/configuracion/, src/api/, tests/
- **Requiere**: claude o codex · node >= 22.18
- **Modo**: odd
- **Governance**: BAJO
- **Leer antes**: `knowledge-base/05_reglas_de_negocio.md` §RN-PR, `knowledge-base/06_funcionalidades.md` §US-012

### [C-06] `gestion-pacientes`
- **Estado**: `[ ]` pendiente
- **Resultado**: alta, edición y búsqueda de pacientes, con DNI único y teléfono normalizado para `wa.me`.
- **Depende de**: C-04
- **Zona**: src/pacientes/, src/api/, tests/
- **Requiere**: claude o codex · node >= 22.18
- **Modo**: sdd
- **Governance**: MEDIO (datos personales)
- **Leer antes**: `knowledge-base/05_reglas_de_negocio.md` §RN-PA, §RN-DA, `knowledge-base/06_funcionalidades.md` §US-020

### [C-08] `bloqueos-de-agenda`
- **Estado**: `[ ]` pendiente
- **Resultado**: CRUD de bloqueos con RN-AG-02. Un bloqueo sobre turnos activos responde 409 con la lista de turnos en conflicto (RN-AG-03).
- **Depende de**: C-04, C-07
- **Zona**: src/agenda/, src/api/, tests/
- **Requiere**: claude o codex · node >= 22.18
- **Modo**: sdd
- **Governance**: MEDIO
- **Leer antes**: `knowledge-base/05_reglas_de_negocio.md` §RN-AG, `knowledge-base/07_flujos_principales.md` §F-07

### [C-12] `registrar-asistencia`
- **Estado**: `[ ]` pendiente
- **Resultado**: `POST /turnos/{id}/asistencia` registra `ASISTIO` o `AUSENTE` solo después del inicio (RN-AS-01).
- **Depende de**: C-07
- **Zona**: src/agenda/, src/api/, tests/
- **Requiere**: claude o codex · node >= 22.18
- **Modo**: odd
- **Governance**: BAJO
- **Leer antes**: `knowledge-base/05_reglas_de_negocio.md` §RN-AS, `knowledge-base/07_flujos_principales.md` §F-06

### [C-13] `recordatorio-whatsapp-wame`
- **Estado**: `[ ]` pendiente
- **Resultado**: `GET /turnos/{id}/recordatorio` devuelve un enlace `wa.me` con nombre, fecha, hora y dirección, **sin la prestación ni datos clínicos** (RN-RE-02).
- **Depende de**: C-07
- **Zona**: src/recordatorios/, src/api/, tests/
- **Requiere**: claude o codex · node >= 22.18
- **Modo**: sdd
- **Governance**: MEDIO (datos personales en mensajes)
- **Leer antes**: `knowledge-base/05_reglas_de_negocio.md` §RN-RE, §RN-PA-02, `knowledge-base/07_flujos_principales.md` §F-05

### [C-14] `frontend-login-y-layout`
- **Estado**: `[ ]` pendiente
- **Resultado**: hay una pantalla de login y un layout común. Una respuesta 401 redirige al login.
- **Depende de**: C-03, C-17
- **Zona**: src/web/
- **Requiere**: claude o codex · node >= 22.18 · navegador
- **Modo**: odd
- **Governance**: ALTO (flujo de sesión)
- **Leer antes**: `knowledge-base/07_flujos_principales.md` §F-01, `knowledge-base/06_funcionalidades.md` §US-001

### [C-15] `frontend-configuracion`
- **Estado**: `[ ]` pendiente
- **Resultado**: pantalla de consultorio, franjas, prestaciones y bloqueos que muestra los errores RN.
- **Depende de**: C-14, C-04, C-05, C-08
- **Zona**: src/web/
- **Requiere**: claude o codex · node >= 22.18 · navegador
- **Modo**: odd
- **Governance**: BAJO
- **Leer antes**: `knowledge-base/06_funcionalidades.md` §Épica 2

### [C-16] `frontend-pacientes`
- **Estado**: `[ ]` pendiente
- **Resultado**: listado con búsqueda y formulario de alta y edición de pacientes.
- **Depende de**: C-14, C-06
- **Zona**: src/web/
- **Requiere**: claude o codex · node >= 22.18 · navegador
- **Modo**: odd
- **Governance**: BAJO
- **Leer antes**: `knowledge-base/06_funcionalidades.md` §US-020

### [C-18] `frontend-acciones-de-turno`
- **Estado**: `[ ]` pendiente
- **Resultado**: desde la agenda se puede crear, cancelar, reprogramar, registrar asistencia y abrir el recordatorio `wa.me`. También hay vista semanal.
- **Depende de**: C-17, C-10, C-11, C-12, C-13
- **Zona**: src/web/
- **Requiere**: claude o codex · node >= 22.18 · navegador
- **Modo**: odd
- **Governance**: BAJO
- **Leer antes**: `knowledge-base/07_flujos_principales.md` §F-02 a §F-06, `knowledge-base/06_funcionalidades.md` §US-031 a §US-050

### [C-20] `persistencia-duradera`
- **Estado**: `[ ]` pendiente
- **Resultado**: los datos sobreviven a un reinicio y RN-TU-10 sigue garantizada.
- **Depende de**: C-07
- **Zona**: src/infra/, tests/
- **Requiere**: claude o codex · node >= 22.18
- **Modo**: sdd
- **Scope**: resolver PA-14 (archivo JSON o `node:sqlite`) y crear un adaptador nuevo de los puertos de C-07, sin cambiar el dominio.
- **Governance**: ALTO
- **Leer antes**: `knowledge-base/09_decisiones_y_supuestos.md` §DD-14, `knowledge-base/10_preguntas_abiertas.md` §PA-14
