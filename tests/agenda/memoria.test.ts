import assert from 'node:assert/strict';
import { test } from 'node:test';
import { crearAgendaEnMemoria } from '../../src/infra/memoria.ts';
import { datosDemo } from '../../src/infra/semilla.ts';

test('RN-AG-01/02 y RN-DA-01: la agenda inyecta el reloj y carga la configuración ficticia', () => {
  const ahora = Date.parse('2030-01-05T12:00:00-03:00');
  const datos = datosDemo(ahora);
  const agenda = crearAgendaEnMemoria(datos, { ahora: () => ahora });

  assert.equal(agenda.reloj.ahora(), ahora);
  assert.equal(agenda.consultorioId, 'consultorio-demo');
  assert.equal(datos.horarios.length, 5);
  for (const dia of [1, 2, 3, 4, 5] as const) {
    assert.deepEqual(agenda.horarios.listarPorDia(dia).map(({ horaInicio, horaFin }) =>
      [horaInicio, horaFin]), [['08:00', '16:00']]);
  }
  assert.deepEqual(agenda.horarios.listarPorDia(6), []);
  const prestacion = agenda.prestaciones.obtener('consulta-general');
  assert.equal(prestacion?.nombre, 'Consulta general');
  assert.equal(prestacion?.duracionMinutos, 20);
  assert.equal(prestacion?.activa, true);
  assert.equal(datos.pacientes.length, 3);
  assert.equal(agenda.pacientes.obtener('paciente-demo-2')?.dni, '00000002');
  assert.equal(datos.bloqueos.length, 1);
  assert.equal(datos.bloqueos[0].inicio, '2030-01-07T13:00:00-03:00');
  assert.deepEqual(agenda.turnos.listarPorFecha('2030-01-07'), []);
});
