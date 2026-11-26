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
  campos: unknown,
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
}

test('C11-15 RN-TU-07: rechaza un paciente inexistente', async t => {
  const datos = datosPrueba();

  const original = {
    ...turnoDemo(
      'turno-original',
      hora('09:00'),
      hora('09:20'),
      'RESERVADO',
    ),
    pacienteId: 'paciente-inexistente',
  };

  const originalAntes = { ...original };

  datos.turnos = [original];

  const app = await iniciarAgenda(t, datos);

  const respuesta = await reprogramar(
    app.url,
    original.id,
    { inicio: hora('10:00') },
  );

  await verificarError(respuesta, 422, 'RN-TU-07');

  assert.deepEqual(
    app.agenda.turnos.listarPorFecha(FECHA),
    [originalAntes],
  );
});

test('C11-16 RN-TU-07: rechaza una prestación inexistente o inactiva', async t => {
  for (const situacion of ['inexistente', 'inactiva']) {
    await t.test(situacion, async caso => {
      const datos = datosPrueba();

      const original = turnoDemo(
        'turno-original',
        hora('09:00'),
        hora('09:20'),
        'RESERVADO',
      );

      const originalAntes = { ...original };

      if (situacion === 'inexistente') {
        datos.prestaciones = datos.prestaciones.filter(
          prestacion => prestacion.id !== original.prestacionId,
        );
      } else {
        datos.prestaciones = datos.prestaciones.map(
          prestacion => prestacion.id === original.prestacionId
            ? { ...prestacion, activa: false }
            : prestacion,
        );
      }

      datos.turnos = [original];

      const app = await iniciarAgenda(caso, datos);

      const respuesta = await reprogramar(
        app.url,
        original.id,
        { inicio: hora('10:00') },
      );

      await verificarError(respuesta, 422, 'RN-TU-07');

      assert.deepEqual(
        app.agenda.turnos.listarPorFecha(FECHA),
        [originalAntes],
      );
    });
  }
});

test('C11-17 RN-TU-06: rechaza el fin enviado por el cliente', async t => {
  const datos = datosPrueba();

  const original = turnoDemo(
    'turno-original',
    hora('09:00'),
    hora('09:20'),
    'RESERVADO',
  );

  const originalAntes = { ...original };

  datos.turnos = [original];

  const app = await iniciarAgenda(t, datos);

  const respuesta = await reprogramar(
    app.url,
    original.id,
    {
      inicio: hora('10:00'),
      fin: hora('10:20'),
    },
  );

  await verificarError(respuesta, 422, 'RN-TU-06');

  assert.deepEqual(
    app.agenda.turnos.listarPorFecha(FECHA),
    [originalAntes],
  );
});

test('C11-18: rechaza cuerpos e inicios inválidos', async t => {
  const datos = datosPrueba();

  const original = turnoDemo(
    'turno-original',
    hora('09:00'),
    hora('09:20'),
    'RESERVADO',
  );

  const originalAntes = { ...original };

  datos.turnos = [original];

  const app = await iniciarAgenda(t, datos);

  const entradasInvalidas = [
    null,
    [],
    'texto',
    {},
    { inicio: null },
    { inicio: 123 },
    { inicio: 'fecha-invalida' },
    { inicio: '2030-01-07T10:00:00' },
  ];

  for (const entrada of entradasInvalidas) {
    await t.test(JSON.stringify(entrada), async () => {
      const respuesta = await reprogramar(
        app.url,
        original.id,
        entrada,
      );

      await verificarError(
        respuesta,
        422,
        'ENTRADA_INVALIDA',
      );

      assert.deepEqual(
        app.agenda.turnos.listarPorFecha(FECHA),
        [originalAntes],
      );
    });
  }
});