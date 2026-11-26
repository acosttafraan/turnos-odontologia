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

test('C11-05 RN-TU-05: rechaza duraciones inválidas sin modificar el turno original', async t => {
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

  const duracionesInvalidas = [
    0,
    4,
    485,
    23,
    20.5,
    -5,
    '30',
    null,
    true,
    [],
    {},
  ];

  for (const duracionMinutos of duracionesInvalidas) {
    await t.test(JSON.stringify(duracionMinutos), async () => {
      const respuesta = await reprogramar(
        app.url,
        original.id,
        {
          inicio: hora('10:00'),
          duracionMinutos,
        },
      );

      await verificarError(
        respuesta,
        422,
        'RN-TU-05',
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