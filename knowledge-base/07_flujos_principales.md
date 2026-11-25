# Flujos Principales

## F-01: Inicio de sesión
**Disparador**: el odontólogo abre la aplicación.
**Actor**: odontólogo.

1. El frontend envía `POST /auth/login` con email y contraseña.
2. La API valida la contraseña contra el hash `scrypt` y emite una cookie de sesión firmada.
3. El frontend guarda la sesión y redirige a la agenda del día.

**Casos de error**: credenciales inválidas → 401 genérico; usuario inactivo → 401.

## F-02: Crear turno (núcleo, US-030)
**Disparador**: el odontólogo elige un horario en la agenda o completa el formulario.
**Actor**: odontólogo.

1. El frontend envía `POST /turnos` con `pacienteId`, `prestacionId`, `inicio` y, opcionalmente, `duracionMinutos`.
2. La aplicación carga el paciente y la prestación, y valida RN-TU-07.
3. El dominio calcula la duración (RN-TU-05) y el fin (RN-TU-06).
4. El dominio valida, en este orden:
   - RN-TU-04: el inicio no está en el pasado.
   - RN-TU-02: el turno cae dentro de una franja.
   - RN-TU-03: no se superpone con bloqueos.
   - RN-TU-01: no se superpone con turnos activos.
5. El repositorio en memoria guarda el turno **en el mismo tramo síncrono** en que se verificaron las reglas, sin `await` en el medio. Eso protege contra pedidos simultáneos (RN-TU-10).
6. La API responde 201 con el turno en estado `RESERVADO`.

```
Odontólogo → Frontend web → API /turnos → Servicio de turnos → Dominio (reglas) → Repositorio en memoria
                                                                              ← 201 Turno
```

**Casos de error**:
- Solapamiento con un turno o un bloqueo → 409 con código y turno o bloqueo en conflicto.
- Fuera de horario, en el pasado o con referencias inválidas → 422 con código.
- Violación de la restricción de exclusión por concurrencia → 409 `RN-TU-10`.

## F-03: Reprogramar turno (US-032)
1. `PUT /turnos/{id}/reprogramar` con el nuevo `inicio` y, opcionalmente, la duración.
2. Valida que el turno original esté activo y no haya empezado.
3. Valida el turno nuevo con F-02 pasos 3-4, **sin contar el turno original** al chequear solapamiento.
4. En una sola transacción, el original pasa a `CANCELADO` (`EN_TERMINO`) y se crea el nuevo con `reprogramado_desde_id`.
5. Responde 200 con el turno nuevo.

**Casos de error**: los mismos que F-02. Si falla cualquier paso, se revierte todo y el original queda intacto.

## F-04: Cancelar turno (US-033)
1. `POST /turnos/{id}/cancelar`.
2. Valida RN-CA-03: el turno está activo y no empezó.
3. Calcula la anticipación (`inicio - ahora`) contra la configuración: si es mayor o igual, `EN_TERMINO`; si es menor, `TARDIA` (RN-CA-01).
4. Persiste `CANCELADO` con su `tipo_cancelacion`. El horario queda libre (RN-CA-02).

## F-05: Recordatorio por WhatsApp (US-050)
1. Desde la agenda, el odontólogo hace clic en "Recordar".
2. El frontend pide `GET /turnos/{id}/recordatorio`.
3. La API valida RN-RE-03, arma el texto con plantilla fija (RN-RE-02), lo codifica y devuelve `https://wa.me/<tel>?text=...`. Registra un `Recordatorio`.
4. El frontend abre el enlace en una pestaña nueva. WhatsApp Web o la app aparece con el mensaje listo.
5. El odontólogo lo envía y opcionalmente lo marca como enviado (`POST .../recordatorio/enviado`).

**Casos de error**: turno cancelado o pasado → 422 `RN-RE-03`; teléfono inválido → 422 `RN-PA-02`.

## F-06: Registrar asistencia (US-040)
1. `POST /turnos/{id}/asistencia` con `{asistio: true|false}`.
2. Valida RN-AS-01 y persiste `ASISTIO` o `AUSENTE`.

## F-07: Crear bloqueo (US-013)
1. `POST /bloqueos` con inicio, fin y motivo.
2. Valida RN-AG-02 y busca turnos activos que se superpongan.
3. Si hay conflictos → 409 con la lista (RN-AG-03). Si no → 201.
