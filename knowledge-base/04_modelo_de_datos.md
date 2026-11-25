# Modelo de Datos

> Persistencia del MVP: **repositorios en memoria** detrás de puertos (DD-14). El modelo se expresa como tipos TypeScript. Una persistencia duradera (archivo JSON o `node:sqlite`) queda abierta en PA-14 y no cambia estos tipos.

## Dominios

- **Acceso**: usuario y credenciales del odontólogo (backlog).
- **Configuración**: consultorio, horario de atención, prestaciones.
- **Agenda**: turnos, bloqueos.
- **Pacientes**: datos mínimos de contacto.
- **Recordatorios**: registro de enlaces generados y enviados.

## ERD

```
Usuario 1──1 Consultorio 1──* FranjaHorario
                 │
                 ├──* Bloqueo
                 ├──* Prestacion 1──* Turno *──1 Paciente
                 └──* Paciente            │
                                          ├──* Recordatorio
                                          └──0..1 Turno (reprogramadoDesdeId)
```

El MVP tiene un único `Consultorio` y un único profesional. Se conserva `consultorioId` para poder crecer sin migrar.

## Convenciones

- Los identificadores son `string` generados con `crypto.randomUUID()`.
- Los instantes son `string` ISO 8601 con offset (por ejemplo `2026-12-01T09:00:00-03:00`). Internamente se comparan como milisegundos UTC (`Date.parse`).
- Las horas del día son `string` `"HH:MM"` en la zona del consultorio (RN-CF-01).
- Los estados son **uniones de literales** (`type EstadoTurno = 'RESERVADO' | ...`), no `enum`, porque Node solo admite sintaxis borrable.

## Entidades

### Usuario (backlog: `acceso-autenticacion`)
```ts
type Usuario = { id: string; email: string; passwordHash: string; sal: string; nombreCompleto: string; activo: boolean; creadoEn: string };
```
- `passwordHash` se calcula con `crypto.scrypt`. El `email` es único.

### Consultorio
```ts
type Consultorio = { id: string; usuarioId: string; nombre: string; direccion: string; telefono: string;
  anticipacionCancelacionHoras: number;  // por defecto 24, rango 0..168 (RN-CF-02)
  zonaHoraria: 'America/Argentina/Buenos_Aires' };
```

### FranjaHorario
```ts
type FranjaHorario = { id: string; consultorioId: string; diaSemana: 1|2|3|4|5|6|7; horaInicio: string; horaFin: string };
```
- `horaInicio < horaFin` y sin solapamiento entre franjas del mismo día (RN-AG-01).

### Bloqueo
```ts
type Bloqueo = { id: string; consultorioId: string; inicio: string; fin: string; motivo: string };
```
- `inicio < fin` (RN-AG-02).

### Prestacion
```ts
type Prestacion = { id: string; consultorioId: string; nombre: string; duracionMinutos: number; activa: boolean };
```
- El `nombre` es único y `duracionMinutos` va de 5 a 480, en múltiplos de 5 (RN-PR-01).

### Paciente
```ts
type Paciente = { id: string; consultorioId: string; nombre: string; apellido: string; dni: string;
  telefono: string;  // normalizado, formato wa.me sin '+' (RN-PA-02)
  email?: string; obraSocial?: string; creadoEn: string };
```
- El `dni` es único por consultorio (RN-PA-01).

### Turno
```ts
type EstadoTurno = 'RESERVADO' | 'CONFIRMADO' | 'CANCELADO' | 'ASISTIO' | 'AUSENTE';
type TipoCancelacion = 'EN_TERMINO' | 'TARDIA';
type Turno = { id: string; consultorioId: string; pacienteId: string; prestacionId: string;
  inicio: string; fin: string;            // fin = inicio + duracionMinutos (RN-TU-06)
  duracionMinutos: number; estado: EstadoTurno;
  tipoCancelacion?: TipoCancelacion; canceladoEn?: string;
  reprogramadoDesdeId?: string; creadoEn: string; actualizadoEn: string };
```
- **Invariante de agenda**: entre los turnos `RESERVADO` o `CONFIRMADO` de un consultorio, ningún par de intervalos `[inicio, fin)` se superpone (RN-TU-01). Lo garantiza el caso de uso, que verifica y guarda sin `await` en el medio (RN-TU-10).
- El repositorio ofrece `listarActivosEntre(desde, hasta)` y `listarPorFecha(fecha)`.

### Recordatorio (backlog)
```ts
type Recordatorio = { id: string; turnoId: string; enlace: string; generadoEn: string; marcadoEnviadoEn?: string };
```

## Datos semilla ficticios

Están en `src/infra/semilla.ts`. Todos los datos son ficticios (RN-DA-01):

- Consultorio "Consultorio Demo", con dirección ficticia y 24 h de anticipación.
- Horario de lunes a viernes, de 09:00 a 13:00 y de 15:00 a 19:00.
- Prestaciones: Consulta (30 min), Limpieza (45), Arreglo (60), Extracción (60), Control (15).
- Tres pacientes ficticios, con DNI de prueba (`00000001`, `00000002`, `00000003`) y teléfonos de ejemplo.

El change `crear-turno-sin-solapamientos` usa estos datos para no depender de los CRUD de configuración y pacientes, que quedan en el backlog.
