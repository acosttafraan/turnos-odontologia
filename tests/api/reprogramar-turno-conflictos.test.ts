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

test('C11-06 RN-TU-01: rechaza solapamientos con otros turnos activos', async t => {
  for (const estado of ['RESERVADO', 'CONFIRMADO'] as const) {
    await t.test(estado, async caso => {
      const datos = datosPrueba();

      const original = turnoDemo(
        'turno-original',
        hora('09:00'),
        hora('09:20'),
        'RESERVADO',
      );

      const ocupado = {
        ...turnoDemo(
          'turno-ocupado',
          hora('10:00'),
          hora('10:20'),
          estado,
        ),
        pacienteId: 'paciente-demo-2',
      };

      const originalAntes = { ...original };
      const ocupadoAntes = { ...ocupado };

      datos.turnos = [original, ocupado];

      const app = await iniciarAgenda(caso, datos);

      const respuesta = await reprogramar(
        app.url,
        original.id,
        { inicio: hora('10:10') },
      );

      const error = await verificarError(
        respuesta,
        409,
        'RN-TU-01',
      );

      assert.match(error.mensaje, /elegí otro horario/i);

      assert.deepEqual(
        app.agenda.turnos.obtener(original.id),
        originalAntes,
      );

      assert.deepEqual(
        app.agenda.turnos.obtener(ocupado.id),
        ocupadoAntes,
      );

      assert.equal(
        app.agenda.turnos.listarPorFecha(FECHA).length,
        2,
      );
    });
  }
});

test('C11-07 RN-TU-02: rechaza un turno que no cabe en una sola franja', async t => {
  const datos = datosPrueba();

  const lunes = datos.horarios[0];

  datos.horarios = [
    { ...lunes, horaFin: '12:10' },
    {
      ...lunes,
      id: 'lunes-tarde',
      horaInicio: '13:00',
    },
  ];

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
    { inicio: hora('12:00') },
  );

  await verificarError(respuesta, 422, 'RN-TU-02');

  assert.deepEqual(
    app.agenda.turnos.listarPorFecha(FECHA),
    [originalAntes],
  );
});

test('C11-08 RN-TU-03: rechaza un horario bloqueado', async t => {
  const datos = datosPrueba();

  datos.bloqueos = [{
    id: 'bloqueo-demo',
    consultorioId: datos.consultorio.id,
    inicio: hora('10:00'),
    fin: hora('11:00'),
    motivo: 'Ejemplo',
  }];

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
    { inicio: hora('10:40') },
  );

  const error = await verificarError(
    respuesta,
    409,
    'RN-TU-03',
  );

  assert.match(error.mensaje, /elegí otro horario/i);

  assert.deepEqual(
    app.agenda.turnos.listarPorFecha(FECHA),
    [originalAntes],
  );
});

test('C11-09 RN-TU-04: el nuevo inicio debe ser estrictamente futuro', async t => {
  const datos = datosPrueba();

  const original = turnoDemo(
    'turno-original',
    hora('11:00'),
    hora('11:20'),
    'RESERVADO',
  );

  const originalAntes = { ...original };

  datos.turnos = [original];

  const app = await iniciarAgenda(
    t,
    datos,
    hora('10:00'),
  );

  for (const inicio of ['09:00', '09:59', '10:00']) {
    await t.test(inicio, async () => {
      const respuesta = await reprogramar(
        app.url,
        original.id,
        { inicio: hora(inicio) },
      );

      await verificarError(
        respuesta,
        422,
        'RN-TU-04',
      );

      assert.deepEqual(
        app.agenda.turnos.listarPorFecha(FECHA),
        [originalAntes],
      );
    });
  }
});