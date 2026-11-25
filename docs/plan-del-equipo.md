# Plan del equipo, paso a paso

Alcance del TP: **un change por integrante** (DD-17). El detalle de cada change está en [CHANGES.md](../CHANGES.md) y las reglas en [AGENTS.md](../AGENTS.md).

| Integrante | Change | Rama |
|---|---|---|
| Francisco Acosta (líder) | `crear-turno-sin-solapamientos` | `C-07-crear-turno-sin-solapamientos` |
| Stefano Senatore | `cancelar-turno-y-liberar-horario` | `C-10-cancelar-turno-y-liberar-horario` |
| Martina Vergara | `reprogramar-turno` | `C-11-reprogramar-turno` |
| Maximiliano Moreno | `pantalla-agenda-diaria` | `C-17-pantalla-agenda-diaria` |

```
Fase 0: repo y preparación      (todos, hoy)
Fase 1: crear-turno + specs     (Francisco implementa; los demás, explore + propose)
Fase 2: los otros tres changes  (en paralelo, cuando crear-turno está en master)
Fase 3: entrega                 (todos)
```

---

## Fase 0: Repo y preparación

### Francisco (líder)
1. Crear en https://github.com/new el repo **`turnos-odontologia`**: público y **vacío** (sin README, sin .gitignore, sin licencia).
2. En **Settings → Collaborators**, invitar a `Stefano-8senatore`, `martina-v4` y `MaximilianoMorenoUTN`. A Stefano darle permiso de escritura, porque es quien sube la fundación.
3. Pasarle la URL del repo a Stefano.

### Stefano (tiene la fundación en su compu)
1. Aceptar la invitación al repo.
2. Desde la carpeta `turnos-odontologia`:
   ```powershell
   git add . ; git commit -m "Fundación: openspec, discovery, KB, roadmap, equipo y reglas del agente"
   ```
   ```powershell
   git remote add origin https://github.com/acosttafraan/turnos-odontologia.git
   ```
   ```powershell
   git push -u origin master
   ```
   (Si la URL del repo es otra, usar la que pasó Francisco.)
3. Avisar al grupo que ya pueden clonar.

### Todos (cada uno en su compu)
1. Tener instalado **Node ≥ 22.19** (`node --version`), Git y Claude Code (u OpenCode) con **Active Stack en modo Full** (Etapa 0 de la consigna).
2. Instalar las dos skills globales del proyecto:
   ```powershell
   npx skills add mattpocock/skills@tdd -g -y
   ```
   ```powershell
   npx skills add mcollina/skills@node -g -y
   ```
3. Si no sos Stefano, clonar el repo y entrar a la carpeta:
   ```powershell
   git clone https://github.com/acosttafraan/turnos-odontologia.git ; cd turnos-odontologia
   ```
4. Configurar tu identidad **solo para este repo**, con el mismo mail que usás en tu cuenta de GitHub:
   ```powershell
   git config user.name "Tu Nombre"
   ```
   ```powershell
   git config user.email "tu-mail-de-github@ejemplo.com"
   ```
   Stefano ya la tiene configurada de forma global. Solo tiene que verificar que ese mail esté en su cuenta de GitHub (**Settings → Emails**).
5. Crear tu rama (ver la tabla de arriba):
   ```powershell
   git switch -c C-XX-nombre-del-change
   ```
6. Abrir el agente en la carpeta y pedirle «qué me toca». Con `active-delivery` te identifica y te muestra tu ficha.

### Martina (además)
- Cerrar la **Etapa 2 del Discovery**:
  - abrir y verificar al menos 5 fuentes y completar la tabla "Verificación de fuentes" de `docs/discovery/informe-discovery.md`;
  - abrir Doctoralia, XIAgenda y Curve Dental;
  - completar la portada;
  - generar `docs/discovery/informe-discovery.pdf`.

  Hacerlo en una rama `discovery-verificacion` con su propio PR.

### Todos (además)
- Revisar las líneas de `docs/bitacora-inspeccion.md` que redactó el agente y corregir lo que no coincida con lo que pasó.
- Confirmar con el docente que el grupo puede ser de 4 (PA-15).

---

## Fase 1: `crear-turno-sin-solapamientos` y los specs de los demás

### Francisco: ciclo OPSX completo de su change
1. **Explore** (`/openspec-explore`): leer la KB (05 §RN-TU, 07 §F-02, 04) y **decidir PA-12** (chequeo de tipos) y **PA-16** (versión mínima de Node).
2. **Propose** (`/openspec-propose crear-turno-sin-solapamientos`):
   - Los escenarios van en formato dado/cuando/entonces: caso feliz, solapamiento (RN-TU-01) y **borde** (un turno que empieza justo cuando termina otro).
   - `proposal.md` justifica la elección y que la regla es solo por profesional (IN-01).
   - **Revisarlo antes de aprobar** y usar Ajustar si hace falta.
3. **Apply** (`/openspec-apply-change`):
   - Proyecto base: `package.json` sin dependencias, servidor, router, errores y reloj.
   - Dominio: `tipos.ts`, `estado.ts` con `transicionarEstado`, puertos y semilla.
   - API: `POST /turnos` y `GET /turnos?fecha=`.
   - README inicial.
4. **Verify**: `node --test` en verde, con un test por escenario.
5. **Archive** (`/openspec-archive-change`). Marcar `[x]` en CHANGES.md y agregar una línea a la bitácora.
6. Push y PR a `master`. **Lo revisa Stefano.** Mergear lo antes posible: los otros tres esperan esto.

### Stefano, Martina y Maximiliano: mientras tanto
1. **Explore** de tu change, leyendo la KB (cada ficha de CHANGES.md tiene su lista "Leer antes").
2. **Propose** de tu change, con al menos 3 escenarios: feliz, error de negocio y borde. **Revisarlo y ajustar antes de aprobar.**
   - **Stefano:** borde de exactamente 24 h → en término, y 23 h 59 min → tardía. Error: cancelar un turno ya empezado.
   - **Martina:** borde: mover 15 min cuando el destino solo se superpone con el propio turno. Error: el destino choca con otro turno y el original queda intacto.
   - **Maximiliano:** decidir **PA-13** (cómo llega el TypeScript al navegador). Borde: dos turnos consecutivos que no se superponen en pantalla. Se puede ir armando la maqueta HTML/CSS estática.
3. **Stefano** revisa el PR de Francisco.
4. Commitear el propose en tu rama (`openspec/changes/<tu-change>/`).

---

## Fase 2: Los otros tres changes (en paralelo)

Arranca cuando `crear-turno-sin-solapamientos` está mergeado en `master`.

### Stefano, Martina y Maximiliano
1. Traer lo nuevo de `master` a tu rama:
   ```powershell
   git switch master ; git pull ; git switch C-XX-tu-rama ; git merge master
   ```
2. **Apply** (`/openspec-apply-change`): implementar **solo** lo que dice tu spec aprobado. Usá `transicionarEstado` y los puertos de crear-turno.
3. **Verify**: `node --test` en verde, con un test por escenario y el código RN en el nombre.
4. Agregar tu sección "Cómo probar" al `README.md`.
5. **Archive** (`/openspec-archive-change`).
6. Marcar tu change `[x]` en `CHANGES.md` y agregar tu línea a `docs/bitacora-inspeccion.md`.
7. Push y PR a `master` con la plantilla. **Lo revisa Francisco.**

### Francisco
- Revisar y mergear los tres PR, uno por vez, resolviendo los conflictos con cada autor.

---

## Fase 3: Entrega

| Quién | Qué |
|---|---|
| Francisco | Prueba final: clonar el repo en una carpeta limpia, seguir **solo** el README y verificar que `node --test` queda en verde y que no hay secretos ni datos reales |
| Francisco | Mostrar la consulta a **Engram** para el video (Etapa 7) |
| Martina | `informe-discovery.pdf` final en `docs/discovery/` |
| Todos | **Reflexión escrita**: cada uno redacta su parte (qué hizo y en qué etapa, dónde usó Ajustar y qué aprendió) |
| Todos | **Video** (8 a 12 min): cada uno aparece con cámara y explica su etapa y su change, mostrando el momento en que revisó el propose |

## Reglas que no se negocian
- Nada directo a `master`: todo entra por PR revisado.
- Cada uno commitea con **su** identidad git.
- **Solo datos ficticios** de pacientes, en todo: código, tests, capturas y commits.
- Sin dependencias npm.
- Una línea en la bitácora al cerrar cada etapa.
