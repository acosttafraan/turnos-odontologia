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
