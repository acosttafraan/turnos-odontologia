import assert from 'node:assert/strict';
import { test } from 'node:test';
import { crearTurno } from '../../src/agenda/crear-turno.ts';
import { reprogramarTurno } from '../../src/agenda/reprogramar-turno.ts';
import { crearAgendaEnMemoria } from '../../src/infra/memoria.ts';
import { datosDemo } from '../../src/infra/semilla.ts';

test('RN-TU-07: rechaza la reprogramación si el paciente no existe', () => {
  const ahora = Date.parse('2030-01-07T08:00:00-03:00');
  const reloj = { ahora: () => ahora };

  const agendaInicial = crearAgendaEnMemoria(
    datosDemo(ahora),
    reloj,
  );

  const original = crearTurno(agendaInicial, {
    pacienteId: 'paciente-demo-1',
    prestacionId: 'consulta-general',
    inicio: Date.parse('2030-01-07T09:00:00-03:00'),
  }, () => 'turno-original');

  const datos = datosDemo(ahora);

  const agenda = crearAgendaEnMemoria({
    ...datos,
    pacientes: datos.pacientes.filter(
      paciente => paciente.id !== original.pacienteId,
    ),
    turnos: [original],
  }, reloj);

  const originalAntes = { ...original };

  assert.throws(() => reprogramarTurno(agenda, original.id, {
    inicio: Date.parse('2030-01-07T11:00:00-03:00'),
  }, () => 'turno-nuevo'), {
    codigo: 'RN-TU-07',
  });

  assert.deepEqual(
    agenda.turnos.obtener(original.id),
    originalAntes,
  );

  assert.equal(
    agenda.turnos.obtener('turno-nuevo'),
    undefined,
  );

  assert.equal(
    agenda.turnos.listarPorFecha('2030-01-07').length,
    1,
  );
});

test('RN-TU-07: rechaza la reprogramación si la prestación no existe', () => {
  const ahora = Date.parse('2030-01-07T08:00:00-03:00');
  const reloj = { ahora: () => ahora };

  const agendaInicial = crearAgendaEnMemoria(
    datosDemo(ahora),
    reloj,
  );

  const original = crearTurno(agendaInicial, {
    pacienteId: 'paciente-demo-1',
    prestacionId: 'consulta-general',
    inicio: Date.parse('2030-01-07T09:00:00-03:00'),
  }, () => 'turno-original');

  const datos = datosDemo(ahora);

  const agenda = crearAgendaEnMemoria({
    ...datos,
    prestaciones: datos.prestaciones.filter(
      prestacion => prestacion.id !== original.prestacionId,
    ),
    turnos: [original],
  }, reloj);

  const originalAntes = { ...original };

  assert.throws(() => reprogramarTurno(agenda, original.id, {
    inicio: Date.parse('2030-01-07T11:00:00-03:00'),
  }, () => 'turno-nuevo'), {
    codigo: 'RN-TU-07',
  });

  assert.deepEqual(
    agenda.turnos.obtener(original.id),
    originalAntes,
  );

  assert.equal(
    agenda.turnos.obtener('turno-nuevo'),
    undefined,
  );

  assert.equal(
    agenda.turnos.listarPorFecha('2030-01-07').length,
    1,
  );
});

test('RN-TU-07: rechaza la reprogramación si la prestación está inactiva', () => {
  const ahora = Date.parse('2030-01-07T08:00:00-03:00');
  const reloj = { ahora: () => ahora };

  const agendaInicial = crearAgendaEnMemoria(
    datosDemo(ahora),
    reloj,
  );

  const original = crearTurno(agendaInicial, {
    pacienteId: 'paciente-demo-1',
    prestacionId: 'consulta-general',
    inicio: Date.parse('2030-01-07T09:00:00-03:00'),
  }, () => 'turno-original');

  const datos = datosDemo(ahora);

  const agenda = crearAgendaEnMemoria({
    ...datos,
    prestaciones: datos.prestaciones.map(prestacion =>
      prestacion.id === original.prestacionId
        ? { ...prestacion, activa: false }
        : prestacion,
    ),
    turnos: [original],
  }, reloj);

  const originalAntes = { ...original };

  assert.throws(() => reprogramarTurno(agenda, original.id, {
    inicio: Date.parse('2030-01-07T11:00:00-03:00'),
  }, () => 'turno-nuevo'), {
    codigo: 'RN-TU-07',
  });

  assert.deepEqual(
    agenda.turnos.obtener(original.id),
    originalAntes,
  );

  assert.equal(
    agenda.turnos.obtener('turno-nuevo'),
    undefined,
  );

  assert.equal(
    agenda.turnos.listarPorFecha('2030-01-07').length,
    1,
  );
});