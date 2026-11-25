# Arquitectura Propuesta

## Patrones aplicados

| Patrón | Dónde se usa | Por qué |
|---|---|---|
| Puertos y adaptadores (hexagonal liviano) | `src/agenda/` (dominio y puertos) ← `src/api/` (HTTP) y `src/infra/` (repos en memoria) | Las reglas se prueban sin servidor y los escenarios de OpenSpec se mapean directo a tests de dominio |
| Funciones de dominio puras | `crearTurno`, `cancelarTurno`, `reprogramarTurno` | Son deterministas y fáciles de testear con `node:test` |
| Value objects como tipos + funciones | `Intervalo` (`[inicio, fin)`, `seSuperponen`), `Duracion`, `Telefono` | Centralizan la fórmula de solapamiento (RN-TU-01) y la normalización (RN-PA-02) |
| Reloj inyectable | Parámetro `ahora: () => Date` o `Reloj` en los casos de uso | Tests deterministas de "pasado" y "anticipación" (RN-TU-04, RN-CA-01) |
| Error de dominio con código | `class ReglaNegocioError extends Error { codigo }` → traductor HTTP en `src/api/` | Cada error se puede rastrear hasta su RN-XX |
| Sección crítica sin `await` | Caso de uso "verificar + guardar" | Atomicidad en un solo proceso (RN-TU-10) |
| Puerto de recordatorios | `RecordatorioPort` → adaptador `wa.me` | Permite migrar a WhatsApp Business API sin tocar el dominio |

## Estructura de directorios

```
turnos-odontologia/
├── package.json            ("type": "module", "engines": { "node": ">=22.18" }, scripts; SIN dependencies)
├── src/
│   ├── agenda/             (dominio: tipos Turno/Intervalo/Bloqueo, reglas RN-TU/RN-CA, casos de uso, puertos)
│   ├── api/                (servidor node:http, router, handlers por recurso, traductor de errores)
│   ├── infra/              (repositorios en memoria, datos semilla ficticios, reloj del sistema)
│   ├── web/                (frontend: *.html, *.css, *.ts por pantalla)
│   └── main.ts             (arranque: node src/main.ts)
├── tests/
│   ├── agenda/             (unitarios de dominio, uno por escenario del spec)
│   └── api/                (integración HTTP levantando el servidor en un puerto efímero)
├── openspec/
├── knowledge-base/
├── CHANGES.md
└── README.md
```

Los imports entre archivos `.ts` llevan la extensión explícita (`import { crearTurno } from './crear-turno.ts'`), porque Node la exige al ejecutar TypeScript nativo.

## Estrategia de tests

| Nivel | Herramienta | Qué cubre |
|---|---|---|
| Unitario de dominio | `node:test` + `node:assert/strict` | Cada regla RN-TU, RN-CA, RN-AG y RN-RE, con un reloj fijo |
| Integración HTTP | `node:test` + `fetch` contra el servidor en un puerto 0 | Rutas, códigos 201/409/422, cuerpo de error con código RN, pedidos concurrentes |
| Frontend | `node:test` sobre las funciones puras de `src/web/` (formateo, armado de la vista del día) | La lógica de presentación, sin navegador (no hay jsdom sin dependencias) |

Cada escenario de un spec de OpenSpec (dado / cuando / entonces) tiene al menos un test con el código RN en su nombre. Comando único: `node --test`.

## Seguridad

- **Autenticación** (change de backlog `acceso-autenticacion`, dominio CRÍTICO): contraseña con `crypto.scrypt` y sal aleatoria, y cookie de sesión `HttpOnly` + `SameSite=Strict`, firmada con HMAC (`crypto.createHmac`).
- **Antes de auth**: mientras los cuatro changes del TP se desarrollan, la API escucha **solo en `127.0.0.1`** y trabaja con **datos ficticios** (DD-15). No se despliega ni se cargan datos reales hasta que exista `acceso-autenticacion`.
- **Validación de entrada**: cada handler valida el cuerpo JSON (tipos, formato ISO, campos obligatorios) antes de llamar al dominio. Las reglas de negocio se validan siempre en el dominio.
- **Secretos**: solo variables de entorno, con `.env.example` sin valores reales.
- **Privacidad**: no se loguean datos personales (RN-DA-03) y todo el seed es ficticio (RN-DA-01).

## Variables de entorno

| Variable | Descripción | Ejemplo | Sensible |
|---|---|---|---|
| `PORT` | Puerto HTTP | `3000` | N |
| `HOST` | Interfaz de escucha | `127.0.0.1` | N |
| `APP_TIMEZONE` | Zona horaria del dominio | `America/Argentina/Buenos_Aires` | N |
| `SESSION_SECRET` | Secreto HMAC de la cookie de sesión (cuando exista auth) | (generado) | **S** |
| `DEMO_USER_PASSWORD` | Contraseña del usuario demo (cuando exista auth) | (local) | **S** |
