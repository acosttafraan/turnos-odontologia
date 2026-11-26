
# Turnos de odontología

Agenda local de demostración para un consultorio. Todos los datos son ficticios y los turnos se guardan en memoria. Al reiniciar se vuelve a la configuración inicial.

## Requisitos y arranque

Usá Node.js 22.18.0 o superior. El proyecto no requiere `npm install`.

```sh
node src/main.ts
```

En otra terminal, comprobá que el servidor responde.

```sh
curl.exe http://127.0.0.1:3000/api/v1/health
```

En Linux, usá `curl` en lugar de `curl.exe` para los ejemplos de consulta. La respuesta esperada de la ruta de salud es `{"estado":"ok"}`. Para detener el servidor, presioná Ctrl+C.

## Pruebas automatizadas

```sh
node --test
```

## Cómo probar cada change

### C-07 · Consultar disponibilidad y reservar

La demo tiene una franja de lunes a viernes de 08:00 a 16:00, hora de Buenos Aires. La prestación `consulta-general` dura 20 minutos. El próximo día hábil tiene un bloqueo de ejemplo de 13:00 a 13:20.

Reemplazá `AAAA-MM-DD` por una fecha hábil futura y consultá los horarios libres.

```sh
curl.exe "http://127.0.0.1:3000/api/v1/disponibilidad?fecha=AAAA-MM-DD&prestacionId=consulta-general"
```

En un día libre, el primer intervalo es 08:00–08:20 y el último es 15:40–16:00. Consultar disponibilidad no guarda turnos.

Con el servidor recién iniciado, usá la misma fecha futura en el ejemplo de PowerShell. Reservá dos horarios contiguos y luego repetí el primero.

```powershell
$fecha = 'AAAA-MM-DD'
$base = 'http://127.0.0.1:3000/api/v1'
$turno = @{
  pacienteId = 'paciente-demo-1'
  prestacionId = 'consulta-general'
  inicio = "${fecha}T08:00:00-03:00"
}
$turno | ConvertTo-Json -Compress | curl.exe -sS -w '\nHTTP %{http_code}\n' -H 'Content-Type: application/json' --data-binary '@-' "$base/turnos"
$turno.inicio = "${fecha}T08:20:00-03:00"
$turno | ConvertTo-Json -Compress | curl.exe -sS -w '\nHTTP %{http_code}\n' -H 'Content-Type: application/json' --data-binary '@-' "$base/turnos"
$turno.inicio = "${fecha}T08:00:00-03:00"
$turno | ConvertTo-Json -Compress | curl.exe -sS -w '\nHTTP %{http_code}\n' -H 'Content-Type: application/json' --data-binary '@-' "$base/turnos"
```

Los dos primeros pedidos devuelven `201`. El tercero devuelve `409 RN-TU-01` y pide elegir otro horario. El servidor calcula el fin a partir de la prestación.

En Linux, podés usar este ejemplo para el POST. Repetilo con `08:20` y luego con `08:00`.

```sh
fecha=AAAA-MM-DD
curl -i -H 'Content-Type: application/json' \
  -d '{"pacienteId":"paciente-demo-1","prestacionId":"consulta-general","inicio":"'${fecha}'T08:00:00-03:00"}' \
  http://127.0.0.1:3000/api/v1/turnos
```

Consultá las reservas de la fecha elegida.

```sh
curl.exe "http://127.0.0.1:3000/api/v1/turnos?fecha=AAAA-MM-DD"
```

La API devuelve los turnos ordenados por inicio, con paciente, prestación y estado. Las fechas de consulta corresponden al calendario de Buenos Aires.

### C-10 · Cancelar un turno y liberar el horario

El odontólogo cancela un turno `RESERVADO` o `CONFIRMADO` que todavía no empezó, con `POST /api/v1/turnos/{id}/cancelar`. Si faltan **24 horas o más** para el inicio, la cancelación es `EN_TERMINO`; si falta menos, es `TARDIA`. Una cancelación tardía no cuenta como ausencia. El horario queda libre en el mismo momento.

Con el servidor recién iniciado, reemplazá `AAAA-MM-DD` por una fecha hábil al menos dos días en el futuro. El ejemplo usa `Invoke-RestMethod` para los POST con cuerpo JSON, porque funciona igual en Windows PowerShell 5.1 y en PowerShell 7. El ejemplo reserva un turno, lo cancela, vuelve a reservar el mismo horario e intenta cancelar dos veces el primer turno.

```powershell
$fecha = 'AAAA-MM-DD'
$base = 'http://127.0.0.1:3000/api/v1'
$turno = @{
  pacienteId = 'paciente-demo-1'
  prestacionId = 'consulta-general'
  inicio = "${fecha}T10:00:00-03:00"
}
$cuerpo = $turno | ConvertTo-Json -Compress
$creado = Invoke-RestMethod -Method Post -Uri "$base/turnos" -ContentType 'application/json' -Body $cuerpo
curl.exe -sS -w '\nHTTP %{http_code}\n' -X POST "$base/turnos/$($creado.id)/cancelar"
Invoke-RestMethod -Method Post -Uri "$base/turnos" -ContentType 'application/json' -Body $cuerpo
curl.exe -sS -w '\nHTTP %{http_code}\n' -X POST "$base/turnos/$($creado.id)/cancelar"
```

La primera cancelación devuelve `200` con `"estado":"CANCELADO"`, `"tipoCancelacion":"EN_TERMINO"` y `canceladoEn`. La nueva reserva de las 10:00 se crea con `"estado":"RESERVADO"` (`201`), porque el horario quedó libre. La segunda cancelación del mismo turno devuelve `422 RN-CA-03`. Un `id` inexistente devuelve `404 TURNO_INEXISTENTE`.

En Linux, cancelá un turno con su `id`:

```sh
curl -i -X POST http://127.0.0.1:3000/api/v1/turnos/ID-DEL-TURNO/cancelar
```

### C-17 · Cómo probar: ver la agenda diaria

1. Iniciá el servidor con `node src/main.ts` y abrí [Agenda diaria](http://127.0.0.1:3000/agenda.html).
2. Usá **Anterior**, **Siguiente** y **Hoy** para navegar. Los días hábiles muestran una franja de 08:00 a 16:00 y los sábados y domingos muestran «Sin atención». El próximo día hábil tiene un bloqueo ficticio de 13:00 a 13:20.
3. Creá los dos turnos consecutivos de la sección C-07 con una fecha hábil futura. Navegá hasta esa fecha. La tabla muestra las dos filas en orden, con horario, paciente, prestación y estado.
4. Ejecutá `node --test` para verificar la vista y sus rutas HTTP.

La pantalla usa `GET /api/v1/turnos?fecha=AAAA-MM-DD` para las reservas y `GET /api/v1/agenda-diaria?fecha=AAAA-MM-DD` para las franjas y los bloqueos. Las dos consultas usan el calendario de Buenos Aires.

### C-11 · Cómo probar: reprogramar un turno

La reprogramación permite cambiar el horario de un turno reservado o confirmado que todavía no comenzó, mediante `PUT /api/v1/turnos/{id}/reprogramar`. El turno original queda cancelado en término y se crea un nuevo turno reservado, vinculado al original mediante `reprogramadoDesdeId`.

Con el servidor recién iniciado, reemplazá `AAAA-MM-DD` por una fecha hábil futura y creá un turno a las 09:00.

Los ejemplos de PowerShell utilizan `Invoke-RestMethod` para evitar problemas con el envío de cuerpos JSON en Windows PowerShell 5.1. Ejecutá los bloques en la misma terminal para conservar las variables.

```powershell
$fecha = 'AAAA-MM-DD'
$base = 'http://127.0.0.1:3000/api/v1'

$turno = @{
  pacienteId = 'paciente-demo-1'
  prestacionId = 'consulta-general'
  inicio = "${fecha}T09:00:00-03:00"
}

$cuerpo = $turno | ConvertTo-Json -Compress

$original = Invoke-RestMethod -Method Post -Uri "$base/turnos" -ContentType 'application/json' -Body $cuerpo

$original | ConvertTo-Json -Depth 10
```

La respuesta esperada es HTTP `201`, con un turno de 09:00 a 09:20 en estado `RESERVADO`. Su identificador queda guardado en `$original.id`.

#### Reprogramar desplazando el turno 15 minutos

```powershell
$reprogramacion = @{
  inicio = "${fecha}T09:15:00-03:00"
}

$cuerpo = $reprogramacion | ConvertTo-Json -Compress

$nuevo = Invoke-RestMethod -Method Put -Uri "$base/turnos/$($original.id)/reprogramar" -ContentType 'application/json' -Body $cuerpo

$nuevo | ConvertTo-Json -Depth 10
```

La respuesta esperada es HTTP `200`, con un nuevo turno de 09:15 a 09:35, en estado `RESERVADO`.

El inicio puede estar fuera de la grilla de disponibilidad, siempre que sea futuro, el turno completo entre en una sola franja de atención y no se superponga con bloqueos ni con otros turnos activos. El turno original se excluye de la comprobación de solapamientos.

Consultá la agenda para verificar el resultado.

```powershell
Invoke-RestMethod -Method Get -Uri "$base/turnos?fecha=$fecha" | ConvertTo-Json -Depth 10
```

El turno original debe conservar su horario histórico, quedar en estado `CANCELADO` y tener `tipoCancelacion` igual a `EN_TERMINO`. El nuevo turno debe tener `reprogramadoDesdeId` igual al identificador original.

#### Reprogramar con duración personalizada

Utilizá el identificador del nuevo turno reservado para realizar otra reprogramación, esta vez indicando una duración de 30 minutos.

```powershell
$reprogramacion = @{
  inicio = "${fecha}T10:00:00-03:00"
  duracionMinutos = 30
}

$cuerpo = $reprogramacion | ConvertTo-Json -Compress

$personalizado = Invoke-RestMethod -Method Put -Uri "$base/turnos/$($nuevo.id)/reprogramar" -ContentType 'application/json' -Body $cuerpo

$personalizado | ConvertTo-Json -Depth 10
```

La respuesta esperada es HTTP `200`, con un turno de 10:00 a 10:30 en estado `RESERVADO`.

Consultá nuevamente la agenda:

```powershell
Invoke-RestMethod -Method Get -Uri "$base/turnos?fecha=$fecha" | ConvertTo-Json -Depth 10
```

Deben aparecer los tres turnos del ejemplo: los dos anteriores en estado `CANCELADO` y el último en estado `RESERVADO`, conservando la cadena de identificadores mediante `reprogramadoDesdeId`.

La duración personalizada debe ser un número entero entre 5 y 480 minutos y múltiplo de 5. Si se omite, se utiliza la duración configurada de la prestación, conforme a RN-TU-05. El servidor calcula el fin; no debe enviarse en la solicitud.

#### Ejemplo de reprogramación en Linux

Con un turno reservado o confirmado previamente creado, reemplazá `ID-DEL-TURNO` por su identificador y `AAAA-MM-DD` por una fecha hábil futura.

```sh
fecha=AAAA-MM-DD
id=ID-DEL-TURNO

curl -i -X PUT \
  -H 'Content-Type: application/json' \
  -d '{"inicio":"'${fecha}'T09:15:00-03:00"}' \
  "http://127.0.0.1:3000/api/v1/turnos/$id/reprogramar"
```

Para indicar una duración personalizada, agregá `"duracionMinutos":30` al cuerpo JSON.

#### Respuestas esperadas

| HTTP | Resultado |
| --- | --- |
| 200 | Reprogramación exitosa. |
| 404 | El turno original no existe (`TURNO_INEXISTENTE`). |
| 409 | El destino se superpone con otro turno activo o un bloqueo (RN-TU-01/RN-TU-03). |
| 422 | La solicitud incumple una regla de validación. |

Ante un error de validación o conflicto, el turno original permanece sin modificaciones y no se crea un nuevo turno.

#### Pruebas automatizadas

Pruebas de dominio:

```sh
node --test tests/agenda/reprogramar-turno.test.ts tests/agenda/reprogramar-turno-estado.test.ts tests/agenda/reprogramar-turno-referencias.test.ts
```

Pruebas HTTP y de concurrencia:

```sh
node --test tests/api/reprogramar-turno.test.ts tests/api/reprogramar-turno-duracion.test.ts tests/api/reprogramar-turno-validaciones.test.ts tests/api/reprogramar-turno-conflictos.test.ts tests/api/reprogramar-turno-estado.test.ts tests/api/reprogramar-turno-entrada.test.ts tests/api/reprogramar-turno-concurrencia.test.ts
```

Para ejecutar todas las pruebas del proyecto:

```sh
node --test
```
