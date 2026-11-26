import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FECHA, PACIENTE, PRESTACION, datosPrueba, iniciarAgenda, turnoDemo } from './agenda-prueba.ts';

test('C07-16 RN-CF-01: filtra por día local y ordena por instante', async t => {
  const datos = datosPrueba();
  datos.turnos = [
    turnoDemo('tarde', '2030-01-07T15:00:00+01:00', '2030-01-07T15:20:00+01:00', 'CANCELADO'),
    turnoDemo('otro-dia', '2030-01-07T02:40:00Z', '2030-01-07T03:00:00Z', 'RESERVADO'),
    turnoDemo('temprano', '2030-01-08T00:00:00+12:00', '2030-01-08T00:20:00+12:00', 'RESERVADO'),
  ];
  const app = await iniciarAgenda(t, datos);
  const respuesta = await app.agendaDiaria(FECHA);
  assert.equal(respuesta.status, 200);
  const turnos = await respuesta.json();
  assert.deepEqual(turnos.map(({ id }: { id: string }) => id), ['temprano', 'tarde']);
  assert.deepEqual(turnos[0].paciente, { id: PACIENTE, nombre: 'Paciente 1', apellido: 'Demo' });
  assert.deepEqual(turnos[0].prestacion, { id: PRESTACION, nombre: 'Consulta general' });
  assert.equal(turnos[0].estado, 'RESERVADO');
  assert.equal(turnos[1].estado, 'CANCELADO');
});

test('C07-17 RN-CF-01: devuelve lista vacía en una fecha válida sin turnos', async t => {
  const app = await iniciarAgenda(t);
  const respuesta = await app.agendaDiaria();
  assert.equal(respuesta.status, 200);
  assert.deepEqual(await respuesta.json(), []);
});

test('C07-19: rechaza fechas ausentes, mal formadas o imposibles', async t => {
  const app = await iniciarAgenda(t);
  for (const consulta of ['', '?fecha=07-01-2030', '?fecha=2026-02-30']) {
    const respuesta = await fetch(app.url + '/api/v1/turnos' + consulta);
    assert.equal(respuesta.status, 422);
    assert.equal((await respuesta.json()).codigo, 'FECHA_INVALIDA');
  }
});
