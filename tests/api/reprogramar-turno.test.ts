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

test('C11-01 RN-TU-09: reprograma un turno y conserva su historial', async t => {
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
    { inicio: hora('10:00') },
  );

  assert.equal(respuesta.status, 200);

  const nuevo = await respuesta.json();

  assert.notEqual(nuevo.id, original.id);
  assert.equal(nuevo.estado, 'RESERVADO');
  assert.equal(nuevo.inicio, hora('10:00'));
  assert.equal(nuevo.fin, hora('10:20'));
  assert.equal(nuevo.duracionMinutos, 20);
  assert.equal(nuevo.pacienteId, original.pacienteId);
  assert.equal(nuevo.prestacionId, original.prestacionId);
  assert.equal(nuevo.consultorioId, original.consultorioId);
  assert.equal(nuevo.reprogramadoDesdeId, original.id);

  const cancelado = app.agenda.turnos.obtener(original.id);

  assert.ok(cancelado);
  assert.equal(cancelado.estado, 'CANCELADO');
  assert.equal(cancelado.tipoCancelacion, 'EN_TERMINO');
  assert.equal(cancelado.inicio, hora('09:00'));
  assert.equal(cancelado.fin, hora('09:20'));
  assert.ok(cancelado.canceladoEn);

  assert.deepEqual(
    app.agenda.turnos.obtener(nuevo.id),
    nuevo,
  );

  assert.equal(
    app.agenda.turnos.listarPorFecha(FECHA).length,
    2,
  );
});

test('C11-02 RN-TU-01/02/09: permite mover un turno 15 minutos fuera de la grilla', async t => {
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
    { inicio: hora('09:15') },
  );

  assert.equal(respuesta.status, 200);

  const nuevo = await respuesta.json();

  assert.notEqual(nuevo.id, original.id);
  assert.equal(nuevo.estado, 'RESERVADO');
  assert.equal(nuevo.inicio, hora('09:15'));
  assert.equal(nuevo.fin, hora('09:35'));
  assert.equal(nuevo.duracionMinutos, 20);
  assert.equal(nuevo.reprogramadoDesdeId, original.id);

  const cancelado = app.agenda.turnos.obtener(original.id);

  assert.ok(cancelado);
  assert.equal(cancelado.estado, 'CANCELADO');
  assert.equal(cancelado.tipoCancelacion, 'EN_TERMINO');
  assert.equal(cancelado.inicio, hora('09:00'));
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