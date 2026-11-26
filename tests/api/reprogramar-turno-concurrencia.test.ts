import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  FECHA,
  datosPrueba,
  hora,
  iniciarAgenda,
  turnoDemo,
} from './agenda-prueba.ts';

test('C11 RN-TU-10/RN-TU-01: dos reprogramaciones simultáneas compiten por el mismo horario', async t => {
  const datos = datosPrueba();

  const original1 = turnoDemo(
    'turno-original-1',
    hora('09:00'),
    hora('09:20'),
    'RESERVADO',
  );

  const original2 = {
    ...turnoDemo(
      'turno-original-2',
      hora('10:00'),
      hora('10:20'),
      'CONFIRMADO',
    ),
    pacienteId: 'paciente-demo-2',
  };

  const originales = [original1, original2];

  const originalesAntes = originales.map(turno => ({
    ...turno,
  }));

  datos.turnos = originales;

  const app = await iniciarAgenda(t, datos);

  const respuestas = await Promise.all(
    originales.map(turno =>
      fetch(
        app.url + '/api/v1/turnos/' +
        encodeURIComponent(turno.id) + '/reprogramar',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inicio: hora('11:00'),
          }),
        },
      ),
    ),
  );

  // Solamente una reprogramación puede tener éxito.
  assert.deepEqual(
    respuestas.map(respuesta => respuesta.status).sort(),
    [200, 409],
  );

  const ganador = respuestas.findIndex(
    respuesta => respuesta.status === 200,
  );

  const perdedor = 1 - ganador;

  const nuevo = await respuestas[ganador].json();
  const conflicto = await respuestas[perdedor].json();

  // Verificar el nuevo turno.
  assert.equal(nuevo.estado, 'RESERVADO');
  assert.equal(nuevo.inicio, hora('11:00'));
  assert.equal(nuevo.fin, hora('11:20'));
  assert.equal(nuevo.duracionMinutos, 20);

  assert.equal(
    nuevo.reprogramadoDesdeId,
    originalesAntes[ganador].id,
  );

  assert.equal(
    nuevo.pacienteId,
    originalesAntes[ganador].pacienteId,
  );

  // Verificar el conflicto de la solicitud rechazada.
  assert.equal(conflicto.codigo, 'RN-TU-01');

  assert.match(
    conflicto.mensaje,
    /elegí otro horario/i,
  );

  // El original ganador debe quedar cancelado en término.
  const cancelado = app.agenda.turnos.obtener(
    originalesAntes[ganador].id,
  );

  assert.ok(cancelado);
  assert.equal(cancelado.estado, 'CANCELADO');
  assert.equal(cancelado.tipoCancelacion, 'EN_TERMINO');

  assert.equal(
    cancelado.inicio,
    originalesAntes[ganador].inicio,
  );

  assert.equal(
    cancelado.fin,
    originalesAntes[ganador].fin,
  );

  // El original perdedor debe permanecer intacto.
  assert.deepEqual(
    app.agenda.turnos.obtener(
      originalesAntes[perdedor].id,
    ),
    originalesAntes[perdedor],
  );

  // El nuevo turno debe estar guardado.
  assert.deepEqual(
    app.agenda.turnos.obtener(nuevo.id),
    nuevo,
  );

  // Deben existir los dos originales y un único turno nuevo.
  const turnos = app.agenda.turnos.listarPorFecha(FECHA);

  assert.equal(turnos.length, 3);

  const activosEnDestino = app.agenda.turnos.listarActivosEntre(
    Date.parse(hora('11:00')),
    Date.parse(hora('11:20')),
  );

  assert.equal(activosEnDestino.length, 1);
  assert.equal(activosEnDestino[0].id, nuevo.id);
});