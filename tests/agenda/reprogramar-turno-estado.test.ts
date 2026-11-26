import assert from 'node:assert/strict';
import { test } from 'node:test';
import { crearTurno } from '../../src/agenda/crear-turno.ts';
import { reprogramarTurno } from '../../src/agenda/reprogramar-turno.ts';
import { transicionarEstado } from '../../src/agenda/estado.ts';
import { crearAgendaEnMemoria } from '../../src/infra/memoria.ts';
import { datosDemo } from '../../src/infra/semilla.ts';

test('RN-TU-08: rechaza la reprogramación de turnos en estados finales', () => {
  const estadosFinales = [
    'CANCELADO',
    'ASISTIO',
    'AUSENTE',
  ] as const;

  for (const estado of estadosFinales) {
    const ahora = Date.parse('2030-01-07T08:00:00-03:00');

    const agenda = crearAgendaEnMemoria(datosDemo(ahora), {
      ahora: () => ahora,
    });

    const original = crearTurno(agenda, {
      pacienteId: 'paciente-demo-1',
      prestacionId: 'consulta-general',
      inicio: Date.parse('2030-01-07T09:00:00-03:00'),
    }, () => 'turno-original');

    const finalizado = transicionarEstado(original, estado);

    agenda.turnos.guardar(finalizado);

    const originalAntes = { ...finalizado };

    assert.throws(() => reprogramarTurno(agenda, original.id, {
      inicio: Date.parse('2030-01-07T11:00:00-03:00'),
    }, () => 'turno-nuevo'), {
      codigo: 'RN-TU-08',
    }, `Debe rechazar el estado ${estado}`);

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
  }
});

test('RN-TU-08: valida el estado original antes que el horario de destino', () => {
  const ahora = Date.parse('2030-01-07T08:00:00-03:00');

  const agenda = crearAgendaEnMemoria(datosDemo(ahora), {
    ahora: () => ahora,
  });

  const original = crearTurno(agenda, {
    pacienteId: 'paciente-demo-1',
    prestacionId: 'consulta-general',
    inicio: Date.parse('2030-01-07T09:00:00-03:00'),
  }, () => 'turno-original');

  const cancelado = transicionarEstado(original, 'CANCELADO', {
    tipo: 'EN_TERMINO',
    canceladoEn: '2030-01-07T08:00:00-03:00',
    actualizadoEn: '2030-01-07T08:00:00-03:00',
  });

  agenda.turnos.guardar(cancelado);

  const originalAntes = { ...cancelado };

  assert.throws(() => reprogramarTurno(agenda, original.id, {
    inicio: Date.parse('2030-01-08T13:00:00-03:00'),
  }, () => 'turno-nuevo'), {
    codigo: 'RN-TU-08',
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

  assert.equal(
    agenda.turnos.listarPorFecha('2030-01-08').length,
    0,
  );
});

test('RN-TU-08 y RN-TU-09: permite reprogramar un turno confirmado y futuro', () => {
  const ahora = Date.parse('2030-01-07T08:00:00-03:00');

  const agenda = crearAgendaEnMemoria(datosDemo(ahora), {
    ahora: () => ahora,
  });

  const original = crearTurno(agenda, {
    pacienteId: 'paciente-demo-1',
    prestacionId: 'consulta-general',
    inicio: Date.parse('2030-01-07T09:00:00-03:00'),
  }, () => 'turno-original');

  const confirmado = transicionarEstado(original, 'CONFIRMADO');

  agenda.turnos.guardar(confirmado);

  const nuevo = reprogramarTurno(agenda, original.id, {
    inicio: Date.parse('2030-01-07T11:00:00-03:00'),
  }, () => 'turno-nuevo');

  assert.equal(nuevo.id, 'turno-nuevo');
  assert.equal(nuevo.estado, 'RESERVADO');
  assert.equal(nuevo.reprogramadoDesdeId, original.id);
  assert.equal(nuevo.pacienteId, original.pacienteId);
  assert.equal(nuevo.prestacionId, original.prestacionId);
  assert.equal(nuevo.inicio, '2030-01-07T11:00:00-03:00');
  assert.equal(nuevo.fin, '2030-01-07T11:20:00-03:00');
  assert.equal(nuevo.duracionMinutos, 20);

  const cancelado = agenda.turnos.obtener(original.id);

  assert.equal(cancelado?.estado, 'CANCELADO');
  assert.equal(cancelado?.tipoCancelacion, 'EN_TERMINO');

  assert.deepEqual(
    agenda.turnos.obtener(nuevo.id),
    nuevo,
  );

  assert.equal(
    agenda.turnos.listarPorFecha('2030-01-07').length,
    2,
  );
});