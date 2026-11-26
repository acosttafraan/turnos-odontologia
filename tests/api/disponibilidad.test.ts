import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FECHA, PRESTACION, datosPrueba, hora, iniciarAgenda, turnoDemo } from './agenda-prueba.ts';

test('C07-23 RN-TU-02/05: ofrece 24 intervalos de 20 minutos sin guardar reservas', async t => {
  const app = await iniciarAgenda(t);
  const respuesta = await app.disponibilidad();
  assert.equal(respuesta.status, 200);
  const intervalos = await respuesta.json();

  assert.equal(intervalos.length, 24);
  assert.deepEqual(intervalos[0], { inicio: hora('08:00'), fin: hora('08:20') });
  assert.deepEqual(intervalos.at(-1), { inicio: hora('15:40'), fin: hora('16:00') });
  for (const [indice, intervalo] of intervalos.entries()) {
    assert.equal(Date.parse(intervalo.fin) - Date.parse(intervalo.inicio), 1_200_000);
    if (indice > 0) assert.equal(intervalo.inicio, intervalos[indice - 1].fin);
  }
  assert.deepEqual(app.agenda.turnos.listarPorFecha(FECHA), []);
});

test('C07-24 RN-TU-01/03/04: filtra inicios no futuros, ocupados y bloqueados', async t => {
  const ahora = hora('08:00');
  const datos = datosPrueba(ahora);
  datos.turnos = [
    turnoDemo('activo', hora('10:00'), hora('10:20'), 'CONFIRMADO'),
    turnoDemo('cancelado', hora('12:00'), hora('12:20'), 'CANCELADO'),
  ];
  datos.bloqueos = [{
    id: 'bloqueo', consultorioId: datos.consultorio.id,
    inicio: hora('11:00'), fin: hora('11:20'), motivo: 'Ejemplo',
  }];
  const app = await iniciarAgenda(t, datos, ahora);
  const respuesta = await app.disponibilidad();
  assert.equal(respuesta.status, 200);
  const inicios = (await respuesta.json()).map(({ inicio }: { inicio: string }) => inicio);
  assert.equal(inicios.length, 21);
  for (const omitido of ['08:00', '10:00', '11:00']) assert.ok(!inicios.includes(hora(omitido)));
  for (const ofrecido of ['08:20', '09:40', '10:20', '10:40', '11:20', '12:00']) {
    assert.ok(inicios.includes(hora(ofrecido)), ofrecido);
  }
});

test('C07-25 RN-TU-07: rechaza parámetros inválidos o prestaciones no disponibles', async t => {
  const datos = datosPrueba();
  datos.prestaciones.push({ ...datos.prestaciones[0], id: 'inactiva', activa: false });
  const app = await iniciarAgenda(t, datos);

  for (const query of ['', '?fecha=' + FECHA, '?prestacionId=' + PRESTACION,
    '?fecha=2030-02-30&prestacionId=' + PRESTACION]) {
    const respuesta = await fetch(app.url + '/api/v1/disponibilidad' + query);
    assert.equal(respuesta.status, 422);
    await respuesta.json();
  }
  for (const prestacionId of ['inexistente', 'inactiva']) {
    const respuesta = await app.disponibilidad(FECHA, prestacionId);
    assert.equal(respuesta.status, 422);
    assert.equal((await respuesta.json()).codigo, 'RN-TU-07');
  }
});

test('C07-26 RN-TU-01/02: devuelve una lista vacía si no hay atención ni horarios libres', async t => {
  const datos = datosPrueba();
  datos.turnos = [turnoDemo('activo', hora('08:00'), hora('16:00'), 'RESERVADO')];
  const app = await iniciarAgenda(t, datos);
  for (const fecha of [FECHA, '2030-01-12']) {
    const respuesta = await app.disponibilidad(fecha);
    assert.equal(respuesta.status, 200);
    assert.deepEqual(await respuesta.json(), []);
  }
});
