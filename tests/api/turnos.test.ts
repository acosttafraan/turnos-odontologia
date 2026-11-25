import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FECHA, datosPrueba, hora, iniciarAgenda, turnoDemo } from './agenda-prueba.ts';

async function verificarError(respuesta: Response, estado: number, codigo: string) {
  assert.equal(respuesta.status, estado);
  const error = await respuesta.json();
  assert.equal(error.codigo, codigo);
  assert.equal(typeof error.mensaje, 'string');
  assert.ok(Object.hasOwn(error, 'detalle'));
  return error;
}

test('C07-02 RN-TU-05/06: reserva con la duración configurada y guarda el fin', async t => {
  const app = await iniciarAgenda(t);
  const respuesta = await app.reservar(hora('08:00'));
  assert.equal(respuesta.status, 201);
  const creado = await respuesta.json();
  assert.equal(creado.estado, 'RESERVADO');
  assert.equal(creado.inicio, hora('08:00'));
  assert.equal(creado.fin, hora('08:20'));
  assert.equal(creado.duracionMinutos, 20);
  assert.deepEqual(app.agenda.turnos.obtener(creado.id), creado);
});


test('C07-03 RN-TU-05: rechaza la duración enviada por el paciente', async t => {
  const app = await iniciarAgenda(t);
  await verificarError(await app.reservar(hora('08:00'), { duracionMinutos: 30 }), 422, 'RN-TU-05');
  assert.deepEqual(app.agenda.turnos.listarPorFecha(FECHA), []);
});

test('C07-04 RN-TU-05/06: una configuración de 30 minutos cambia oferta y fin', async t => {
  const datos = datosPrueba();
  datos.prestaciones[0].duracionMinutos = 30;
  const app = await iniciarAgenda(t, datos);
  const consulta = await app.disponibilidad();
  assert.equal(consulta.status, 200);
  const horarios = await consulta.json();
  assert.equal(horarios.length, 16);
  assert.deepEqual(horarios[1], { inicio: hora('08:30'), fin: hora('09:00') });
  const respuesta = await app.reservar(horarios[1].inicio);
  assert.equal(respuesta.status, 201);
  assert.equal((await respuesta.json()).fin, hora('09:00'));
});

test('C07-18 RN-TU-06: rechaza el fin enviado por el cliente', async t => {
  const app = await iniciarAgenda(t);
  await verificarError(await app.reservar(hora('08:00'), { fin: hora('08:20') }), 422, 'RN-TU-06');
  assert.deepEqual(app.agenda.turnos.listarPorFecha(FECHA), []);
});

test('C07-05 RN-TU-07: rechaza paciente inexistente', async t => {
  const app = await iniciarAgenda(t);
  await verificarError(await app.reservar(hora('08:00'), { pacienteId: 'inexistente' }), 422, 'RN-TU-07');
  assert.deepEqual(app.agenda.turnos.listarPorFecha(FECHA), []);
});

test('C07-06 RN-TU-07: rechaza prestación inactiva', async t => {
  const datos = datosPrueba();
  datos.prestaciones[0].activa = false;
  const app = await iniciarAgenda(t, datos);
  await verificarError(await app.reservar(hora('08:00')), 422, 'RN-TU-07');
  assert.deepEqual(app.agenda.turnos.listarPorFecha(FECHA), []);
});

test('C07-07 RN-TU-04: el inicio debe ser estrictamente futuro', async t => {
  const app = await iniciarAgenda(t, datosPrueba(), hora('08:20'));
  for (const inicio of ['08:00', '08:20']) {
    await verificarError(await app.reservar(hora(inicio)), 422, 'RN-TU-04');
  }
  assert.deepEqual(app.agenda.turnos.listarPorFecha(FECHA), []);
});

test('C07-08 RN-TU-02: rechaza un turno que cruza el corte entre franjas', async t => {
  const datos = datosPrueba();
  const lunes = datos.horarios[0];
  datos.horarios = [
    { ...lunes, horaFin: '12:10' },
    { ...lunes, id: 'lunes-tarde', horaInicio: '13:00' },
  ];
  const app = await iniciarAgenda(t, datos);
  await verificarError(await app.reservar(hora('12:00')), 422, 'RN-TU-02');
  assert.deepEqual(app.agenda.turnos.listarPorFecha(FECHA), []);
});

test('C07-09 RN-TU-02: rechaza un turno en un día sin atención', async t => {
  const app = await iniciarAgenda(t);
  const sabado = '2030-01-12';
  await verificarError(await app.reservar(hora('08:00', sabado)), 422, 'RN-TU-02');
  assert.deepEqual(app.agenda.turnos.listarPorFecha(sabado), []);
});

function datosConBloqueo() {
  const datos = datosPrueba();
  datos.bloqueos = [{
    id: 'bloqueo', consultorioId: datos.consultorio.id,
    inicio: hora('10:00'), fin: hora('11:00'), motivo: 'Ejemplo',
  }];
  return datos;
}

test('C07-10 RN-TU-03: un bloqueo produce 409 y pide otro horario', async t => {
  const app = await iniciarAgenda(t, datosConBloqueo());
  const error = await verificarError(await app.reservar(hora('10:40')), 409, 'RN-TU-03');
  assert.match(error.mensaje, /elegí otro horario/i);
  assert.deepEqual(app.agenda.turnos.listarPorFecha(FECHA), []);
});

test('C07-11 RN-TU-03: permite un turno al finalizar un bloqueo', async t => {
  const app = await iniciarAgenda(t, datosConBloqueo());
  const respuesta = await app.reservar(hora('11:00'));
  assert.equal(respuesta.status, 201);
  const turno = await respuesta.json();
  assert.equal(turno.fin, hora('11:20'));
  assert.deepEqual(app.agenda.turnos.listarPorFecha(FECHA), [turno]);
});

test('C07-12 RN-TU-01: rechaza solapamiento con un turno reservado o confirmado', async t => {
  for (const estado of ['RESERVADO', 'CONFIRMADO'] as const) {
    await t.test(estado, async caso => {
      const datos = datosPrueba();
      const anterior = turnoDemo('activo', hora('09:00'), hora('09:30'), estado);
      datos.turnos = [anterior];
      const app = await iniciarAgenda(caso, datos);
      const error = await verificarError(await app.reservar(hora('09:20')), 409, 'RN-TU-01');
      assert.match(error.mensaje, /elegí otro horario/i);
      assert.deepEqual(app.agenda.turnos.listarPorFecha(FECHA), [anterior]);
    });
  }
});

test('C07-13 RN-TU-01: guarda ambos turnos contiguos', async t => {
  const datos = datosPrueba();
  const anterior = turnoDemo('activo', hora('09:00'), hora('09:20'), 'RESERVADO');
  datos.turnos = [anterior];
  const app = await iniciarAgenda(t, datos);
  const respuesta = await app.reservar(hora('09:20'));
  assert.equal(respuesta.status, 201);
  const nuevo = await respuesta.json();
  assert.equal(nuevo.inicio, anterior.fin);
  assert.equal(nuevo.fin, hora('09:40'));
  assert.deepEqual(app.agenda.turnos.listarPorFecha(FECHA), [anterior, nuevo]);
});

test('C07-14 RN-TU-01: los estados finales no bloquean el horario', async t => {
  for (const estado of ['CANCELADO', 'ASISTIO', 'AUSENTE'] as const) {
    await t.test(estado, async caso => {
      const datos = datosPrueba();
      const anterior = turnoDemo('final', hora('08:00'), hora('08:20'), estado);
      datos.turnos = [anterior];
      const app = await iniciarAgenda(caso, datos);
      const respuesta = await app.reservar(hora('08:00'));
      assert.equal(respuesta.status, 201);
      assert.deepEqual(app.agenda.turnos.listarPorFecha(FECHA), [anterior, await respuesta.json()]);
    });
  }
});


test('C07-20 RN-TU-02/06: ofrece 15:40 y permite reservar hasta las 16:00', async t => {
  const app = await iniciarAgenda(t);
  const consulta = await app.disponibilidad();
  assert.equal(consulta.status, 200);
  const ultimo = (await consulta.json()).at(-1);
  assert.deepEqual(ultimo, { inicio: hora('15:40'), fin: hora('16:00') });
  const respuesta = await app.reservar(ultimo.inicio);
  assert.equal(respuesta.status, 201);
  const turno = await respuesta.json();
  assert.equal(turno.fin, hora('16:00'));
  assert.deepEqual(app.agenda.turnos.listarPorFecha(FECHA), [turno]);
});

test('C07-21 RN-TU-02: rechaza las 15:50 porque el turno terminaría a las 16:10', async t => {
  const app = await iniciarAgenda(t);
  await verificarError(await app.reservar(hora('15:50')), 422, 'RN-TU-02');
  assert.deepEqual(app.agenda.turnos.listarPorFecha(FECHA), []);
});

test('C07-22 RN-TU-02: rechaza inicios que no corresponden a los horarios ofrecidos', async t => {
  const app = await iniciarAgenda(t);
  const error = await verificarError(await app.reservar(hora('08:10')), 422, 'RN-TU-02');
  assert.match(error.mensaje, /elegí uno de los horarios ofrecidos/i);
  assert.deepEqual(app.agenda.turnos.listarPorFecha(FECHA), []);
});
