import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  FECHA,
  datosPrueba,
  hora,
  iniciarAgenda,
  turnoDemo,
} from './agenda-prueba.ts';

function reprogramar(
  url: string,
  id: string,
  campos: Record<string, unknown>,
): Promise<Response> {
  return fetch(
    url + '/api/v1/turnos/' + encodeURIComponent(id) + '/reprogramar',
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campos),
    },
  );
}

test('C11-03 RN-TU-05/06: permite indicar una duración personalizada', async t => {
  const datos = datosPrueba();

  const original = turnoDemo(
    'turno-original',
    hora('09:00'),
    hora('09:20'),
    'RESERVADO',
  );

  datos.turnos = [original];

  const app = await iniciarAgenda(t, datos);

  const respuesta = await reprogramar(
    app.url,
    original.id,
    {
      inicio: hora('10:00'),
      duracionMinutos: 30,
    },
  );

  assert.equal(respuesta.status, 200);

  const nuevo = await respuesta.json();

  assert.equal(nuevo.inicio, hora('10:00'));
  assert.equal(nuevo.fin, hora('10:30'));
  assert.equal(nuevo.duracionMinutos, 30);
  assert.equal(nuevo.estado, 'RESERVADO');
  assert.equal(nuevo.reprogramadoDesdeId, original.id);

  const cancelado = app.agenda.turnos.obtener(original.id);

  assert.ok(cancelado);
  assert.equal(cancelado.estado, 'CANCELADO');
  assert.equal(cancelado.duracionMinutos, 20);
  assert.equal(cancelado.fin, hora('09:20'));

  assert.deepEqual(
    app.agenda.turnos.obtener(nuevo.id),
    nuevo,
  );

  assert.equal(
    app.agenda.turnos.listarPorFecha(FECHA).length,
    2,
  );
});

test('C11-04 RN-TU-05: al omitir la duración utiliza la de la prestación', async t => {
  const datos = datosPrueba();

  const original = turnoDemo(
    'turno-original',
    hora('09:00'),
    hora('09:30'),
    'RESERVADO',
  );

  datos.turnos = [original];

  const app = await iniciarAgenda(t, datos);

  const respuesta = await reprogramar(
    app.url,
    original.id,
    { inicio: hora('10:00') },
  );

  assert.equal(respuesta.status, 200);

  const nuevo = await respuesta.json();

  assert.equal(nuevo.duracionMinutos, 20);
  assert.equal(nuevo.inicio, hora('10:00'));
  assert.equal(nuevo.fin, hora('10:20'));
  assert.equal(nuevo.reprogramadoDesdeId, original.id);

  const cancelado = app.agenda.turnos.obtener(original.id);

  assert.ok(cancelado);
  assert.equal(cancelado.estado, 'CANCELADO');
  assert.equal(cancelado.duracionMinutos, 30);
  assert.equal(cancelado.fin, hora('09:30'));

  assert.deepEqual(
    app.agenda.turnos.obtener(nuevo.id),
    nuevo,
  );

  assert.equal(
    app.agenda.turnos.listarPorFecha(FECHA).length,
    2,
  );
});