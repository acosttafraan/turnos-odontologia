import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FECHA, datosPrueba, hora, iniciarAgenda, turnoDemo } from './agenda-prueba.ts';

// AHORA en agenda-prueba.ts es 2030-01-06T00:00-03:00 y FECHA es 2030-01-07 (datos ficticios).
function cancelar(url: string, id: string) {
  return fetch(url + '/api/v1/turnos/' + encodeURIComponent(id) + '/cancelar', { method: 'POST' });
}

test('C10-12 RN-CA-01: la cancelación exitosa responde 200 con estado, tipo y momento', async t => {
  const datos = datosPrueba();
  datos.turnos = [turnoDemo('turno-1', hora('10:00'), hora('10:20'), 'RESERVADO')];
  const app = await iniciarAgenda(t, datos);
  const respuesta = await cancelar(app.url, 'turno-1');
  assert.equal(respuesta.status, 200);
  const cuerpo = await respuesta.json();
  assert.equal(cuerpo.id, 'turno-1');
  assert.equal(cuerpo.estado, 'CANCELADO');
  assert.equal(cuerpo.tipoCancelacion, 'EN_TERMINO');
  assert.equal(cuerpo.canceladoEn, '2030-01-06T00:00:00-03:00');
});

test('C10-13: cancelar un turno inexistente responde 404', async t => {
  const app = await iniciarAgenda(t);
  const respuesta = await cancelar(app.url, 'no-existe');
  assert.equal(respuesta.status, 404);
  const error = await respuesta.json();
  assert.equal(error.codigo, 'TURNO_INEXISTENTE');
  assert.equal(typeof error.mensaje, 'string');
});

test('C10-14 RN-CA-03: cancelar un turno que ya empezó responde 422 con el código de regla', async t => {
  const datos = datosPrueba();
  datos.turnos = [turnoDemo('turno-viejo', hora('23:00', '2030-01-05'), hora('23:20', '2030-01-05'), 'RESERVADO')];
  const app = await iniciarAgenda(t, datos);
  const respuesta = await cancelar(app.url, 'turno-viejo');
  assert.equal(respuesta.status, 422);
  const error = await respuesta.json();
  assert.equal(error.codigo, 'RN-CA-03');
  assert.ok(Object.hasOwn(error, 'detalle'));
  assert.equal(app.agenda.turnos.obtener('turno-viejo')?.estado, 'RESERVADO');
});

test('C10-07 RN-CA-02: después de cancelar, el mismo horario se puede reservar otra vez', async t => {
  const app = await iniciarAgenda(t);
  const primera = await app.reservar(hora('10:00'));
  assert.equal(primera.status, 201);
  const { id } = await primera.json();

  const ocupado = await app.reservar(hora('10:00'));
  assert.equal(ocupado.status, 409);
  assert.equal((await ocupado.json()).codigo, 'RN-TU-01');

  assert.equal((await cancelar(app.url, id)).status, 200);

  const segunda = await app.reservar(hora('10:00'));
  assert.equal(segunda.status, 201);
  const agendaDelDia = await (await app.agendaDiaria(FECHA)).json();
  const estados = agendaDelDia.map((turno: { estado: string }) => turno.estado).sort();
  assert.deepEqual(estados, ['CANCELADO', 'RESERVADO']);
});
