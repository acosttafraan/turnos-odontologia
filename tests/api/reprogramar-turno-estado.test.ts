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

async function verificarError(
  respuesta: Response,
  estado: number,
  codigo: string,
) {
  assert.equal(respuesta.status, estado);

  const error = await respuesta.json();

  assert.equal(error.codigo, codigo);
  assert.equal(typeof error.mensaje, 'string');
  assert.ok(Object.hasOwn(error, 'detalle'));

  return error;
}

test('C11-10: devuelve 404 cuando el turno original no existe', async t => {
  const datos = datosPrueba();

  const existente = turnoDemo(
    'turno-existente',
    hora('09:00'),
    hora('09:20'),
    'RESERVADO',
  );

  const existenteAntes = { ...existente };

  datos.turnos = [existente];

  const app = await iniciarAgenda(t, datos);

  const respuesta = await reprogramar(
    app.url,
    'turno-inexistente',
    { inicio: hora('10:00') },
  );

  await verificarError(
    respuesta,
    404,
    'TURNO_INEXISTENTE',
  );

  assert.deepEqual(
    app.agenda.turnos.listarPorFecha(FECHA),
    [existenteAntes],
  );
});

test('C11-11 RN-TU-08: rechaza la reprogramación de turnos en estados finales', async t => {
  for (const estado of ['CANCELADO', 'ASISTIO', 'AUSENTE'] as const) {
    await t.test(estado, async caso => {
      const datos = datosPrueba();

      const original = turnoDemo(
        'turno-original',
        hora('09:00'),
        hora('09:20'),
        estado,
      );

      const originalAntes = { ...original };

      datos.turnos = [original];

      const app = await iniciarAgenda(caso, datos);

      const respuesta = await reprogramar(
        app.url,
        original.id,
        { inicio: hora('10:00') },
      );

      await verificarError(
        respuesta,
        422,
        'RN-TU-08',
      );

      assert.deepEqual(
        app.agenda.turnos.obtener(original.id),
        originalAntes,
      );

      assert.deepEqual(
        app.agenda.turnos.listarPorFecha(FECHA),
        [originalAntes],
      );
    });
  }
});

test('C11-12 RN-TU-09: rechaza la reprogramación de un turno que ya comenzó', async t => {
  for (const ahora of ['09:00', '09:10']) {
    await t.test(ahora, async caso => {
      const datos = datosPrueba();

      const original = turnoDemo(
        'turno-original',
        hora('09:00'),
        hora('09:20'),
        'RESERVADO',
      );

      const originalAntes = { ...original };

      datos.turnos = [original];

      const app = await iniciarAgenda(
        caso,
        datos,
        hora(ahora),
      );

      const respuesta = await reprogramar(
        app.url,
        original.id,
        { inicio: hora('11:00') },
      );

      await verificarError(
        respuesta,
        422,
        'RN-TU-09',
      );

      assert.deepEqual(
        app.agenda.turnos.listarPorFecha(FECHA),
        [originalAntes],
      );
    });
  }
});

test('C11-13 RN-TU-08/09: permite reprogramar un turno confirmado', async t => {
  const datos = datosPrueba();

  const original = turnoDemo(
    'turno-original',
    hora('09:00'),
    hora('09:20'),
    'CONFIRMADO',
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

  assert.equal(nuevo.estado, 'RESERVADO');
  assert.equal(nuevo.inicio, hora('10:00'));
  assert.equal(nuevo.fin, hora('10:20'));
  assert.equal(nuevo.reprogramadoDesdeId, original.id);

  const cancelado = app.agenda.turnos.obtener(original.id);

  assert.ok(cancelado);
  assert.equal(cancelado.estado, 'CANCELADO');
  assert.equal(cancelado.tipoCancelacion, 'EN_TERMINO');

  assert.deepEqual(
    app.agenda.turnos.obtener(nuevo.id),
    nuevo,
  );

  assert.equal(
    app.agenda.turnos.listarPorFecha(FECHA).length,
    2,
  );
});

test('C11-14 RN-TU-09: cancela en término aunque falten menos de 24 horas', async t => {
  const datos = datosPrueba();

  const original = turnoDemo(
    'turno-original',
    hora('09:00'),
    hora('09:20'),
    'RESERVADO',
  );

  datos.turnos = [original];

  const app = await iniciarAgenda(
    t,
    datos,
    hora('08:00'),
  );

  const respuesta = await reprogramar(
    app.url,
    original.id,
    { inicio: hora('11:00') },
  );

  assert.equal(respuesta.status, 200);

  const nuevo = await respuesta.json();

  assert.equal(nuevo.estado, 'RESERVADO');
  assert.equal(nuevo.reprogramadoDesdeId, original.id);

  const cancelado = app.agenda.turnos.obtener(original.id);

  assert.ok(cancelado);
  assert.equal(cancelado.estado, 'CANCELADO');
  assert.equal(cancelado.tipoCancelacion, 'EN_TERMINO');
  assert.equal(cancelado.canceladoEn, hora('08:00'));

  assert.equal(
    app.agenda.turnos.listarPorFecha(FECHA).length,
    2,
  );
});