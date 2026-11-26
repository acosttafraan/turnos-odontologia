import assert from 'node:assert/strict';
import { test } from 'node:test';
import { crearTurno } from '../../src/agenda/crear-turno.ts';
import { reprogramarTurno } from '../../src/agenda/reprogramar-turno.ts';
import { crearAgendaEnMemoria } from '../../src/infra/memoria.ts';
import { datosDemo } from '../../src/infra/semilla.ts';

test('RN-TU-09: reprograma un turno a un horario libre', () => {
  const ahora = Date.parse('2030-01-07T08:00:00-03:00');
  const agenda = crearAgendaEnMemoria(datosDemo(ahora), {
    ahora: () => ahora,
  });

  const original = crearTurno(agenda, {
    pacienteId: 'paciente-demo-1',
    prestacionId: 'consulta-general',
    inicio: Date.parse('2030-01-07T09:00:00-03:00'),
  }, () => 'turno-original');

  const nuevo = reprogramarTurno(agenda, original.id, {
    inicio: Date.parse('2030-01-07T10:00:00-03:00'),
  }, () => 'turno-nuevo');

  assert.equal(nuevo.id, 'turno-nuevo');
  assert.equal(nuevo.estado, 'RESERVADO');
  assert.equal(nuevo.pacienteId, original.pacienteId);
  assert.equal(nuevo.prestacionId, original.prestacionId);
  assert.equal(nuevo.reprogramadoDesdeId, original.id);
  assert.equal(nuevo.inicio, '2030-01-07T10:00:00-03:00');
  assert.equal(nuevo.fin, '2030-01-07T10:20:00-03:00');
  assert.equal(nuevo.duracionMinutos, 20);

  const cancelado = agenda.turnos.obtener(original.id);

  assert.equal(cancelado?.estado, 'CANCELADO');
  assert.equal(cancelado?.tipoCancelacion, 'EN_TERMINO');
  assert.deepEqual(agenda.turnos.obtener(nuevo.id), nuevo);
  assert.equal(agenda.turnos.listarPorFecha('2030-01-07').length, 2);
});

test('RN-TU-01: rechaza el solapamiento con otro turno y conserva el original', () => {
  const ahora = Date.parse('2030-01-07T08:00:00-03:00');
  const agenda = crearAgendaEnMemoria(datosDemo(ahora), {
    ahora: () => ahora,
  });

  const original = crearTurno(agenda, {
    pacienteId: 'paciente-demo-1',
    prestacionId: 'consulta-general',
    inicio: Date.parse('2030-01-07T09:00:00-03:00'),
  }, () => 'turno-original');

  const ocupado = crearTurno(agenda, {
    pacienteId: 'paciente-demo-2',
    prestacionId: 'consulta-general',
    inicio: Date.parse('2030-01-07T10:00:00-03:00'),
  }, () => 'turno-ocupado');

  assert.throws(() => reprogramarTurno(agenda, original.id, {
    inicio: Date.parse('2030-01-07T10:00:00-03:00'),
  }, () => 'turno-nuevo'), { codigo: 'RN-TU-01' });

  assert.deepEqual(agenda.turnos.obtener(original.id), original);
  assert.deepEqual(agenda.turnos.obtener(ocupado.id), ocupado);
  assert.equal(agenda.turnos.obtener('turno-nuevo'), undefined);
  assert.equal(agenda.turnos.listarPorFecha('2030-01-07').length, 2);
});

test('RN-TU-01 y RN-TU-02: permite desplazar un turno 15 minutos fuera de la grilla', () => {
  const ahora = Date.parse('2030-01-07T08:00:00-03:00');
  const agenda = crearAgendaEnMemoria(datosDemo(ahora), {
    ahora: () => ahora,
  });

  const original = crearTurno(agenda, {
    pacienteId: 'paciente-demo-1',
    prestacionId: 'consulta-general',
    inicio: Date.parse('2030-01-07T09:00:00-03:00'),
  }, () => 'turno-original');

  const nuevo = reprogramarTurno(agenda, original.id, {
    inicio: Date.parse('2030-01-07T09:15:00-03:00'),
  }, () => 'turno-nuevo');

  assert.equal(nuevo.inicio, '2030-01-07T09:15:00-03:00');
  assert.equal(nuevo.fin, '2030-01-07T09:35:00-03:00');
  assert.equal(nuevo.duracionMinutos, 20);
  assert.equal(nuevo.estado, 'RESERVADO');
  assert.equal(nuevo.reprogramadoDesdeId, original.id);

  const cancelado = agenda.turnos.obtener(original.id);

  assert.equal(cancelado?.estado, 'CANCELADO');
  assert.equal(cancelado?.tipoCancelacion, 'EN_TERMINO');
  assert.equal(cancelado?.inicio, '2030-01-07T09:00:00-03:00');
  assert.equal(cancelado?.fin, '2030-01-07T09:20:00-03:00');

  assert.deepEqual(agenda.turnos.obtener(nuevo.id), nuevo);
  assert.equal(agenda.turnos.listarPorFecha('2030-01-07').length, 2);
});

test('RN-TU-05 y RN-TU-06: utiliza la duración personalizada y calcula el fin', () => {
  const ahora = Date.parse('2030-01-07T08:00:00-03:00');
  const agenda = crearAgendaEnMemoria(datosDemo(ahora), {
    ahora: () => ahora,
  });

  const original = crearTurno(agenda, {
    pacienteId: 'paciente-demo-1',
    prestacionId: 'consulta-general',
    inicio: Date.parse('2030-01-07T09:00:00-03:00'),
  }, () => 'turno-original');

  assert.equal(original.duracionMinutos, 20);

  const nuevo = reprogramarTurno(agenda, original.id, {
    inicio: Date.parse('2030-01-07T10:00:00-03:00'),
    duracionMinutos: 30,
  }, () => 'turno-nuevo');

  assert.equal(nuevo.duracionMinutos, 30);
  assert.equal(nuevo.inicio, '2030-01-07T10:00:00-03:00');
  assert.equal(nuevo.fin, '2030-01-07T10:30:00-03:00');
  assert.equal(nuevo.estado, 'RESERVADO');
  assert.equal(nuevo.reprogramadoDesdeId, original.id);

  const cancelado = agenda.turnos.obtener(original.id);

  assert.equal(cancelado?.estado, 'CANCELADO');
  assert.equal(cancelado?.tipoCancelacion, 'EN_TERMINO');
  assert.equal(cancelado?.duracionMinutos, 20);
  assert.equal(cancelado?.fin, '2030-01-07T09:20:00-03:00');

  assert.deepEqual(agenda.turnos.obtener(nuevo.id), nuevo);
  assert.equal(agenda.turnos.listarPorFecha('2030-01-07').length, 2);
});

test('RN-TU-05: rechaza duraciones inválidas sin modificar el turno original', () => {
  const duracionesInvalidas = [0, 4, 485, 23, 20.5, -5];

  for (const duracionMinutos of duracionesInvalidas) {
    const ahora = Date.parse('2030-01-07T08:00:00-03:00');
    const agenda = crearAgendaEnMemoria(datosDemo(ahora), {
      ahora: () => ahora,
    });

    const original = crearTurno(agenda, {
      pacienteId: 'paciente-demo-1',
      prestacionId: 'consulta-general',
      inicio: Date.parse('2030-01-07T09:00:00-03:00'),
    }, () => 'turno-original');

    const originalAntes = { ...original };

    assert.throws(() => reprogramarTurno(agenda, original.id, {
      inicio: Date.parse('2030-01-07T10:00:00-03:00'),
      duracionMinutos,
    }, () => 'turno-nuevo'), {
      codigo: 'RN-TU-05',
    }, `Debe rechazar la duración de ${duracionMinutos} minutos`);

    assert.deepEqual(
      agenda.turnos.obtener(original.id),
      originalAntes,
    );

    assert.equal(agenda.turnos.obtener('turno-nuevo'), undefined);
    assert.equal(agenda.turnos.listarPorFecha('2030-01-07').length, 1);
  }
});

test('RN-TU-05 y RN-TU-06: utiliza la duración de la prestación cuando se omite la duración', () => {
  const ahora = Date.parse('2030-01-07T08:00:00-03:00');
  const agenda = crearAgendaEnMemoria(datosDemo(ahora), {
    ahora: () => ahora,
  });

  const original = crearTurno(agenda, {
    pacienteId: 'paciente-demo-1',
    prestacionId: 'consulta-general',
    inicio: Date.parse('2030-01-07T09:00:00-03:00'),
  }, () => 'turno-original');

  assert.equal(original.duracionMinutos, 20);

  const personalizado = reprogramarTurno(agenda, original.id, {
    inicio: Date.parse('2030-01-07T10:00:00-03:00'),
    duracionMinutos: 30,
  }, () => 'turno-personalizado');

  assert.equal(personalizado.duracionMinutos, 30);
  assert.equal(personalizado.fin, '2030-01-07T10:30:00-03:00');

  const nuevo = reprogramarTurno(agenda, personalizado.id, {
    inicio: Date.parse('2030-01-07T11:00:00-03:00'),
  }, () => 'turno-nuevo');

  assert.equal(nuevo.duracionMinutos, 20);
  assert.equal(nuevo.inicio, '2030-01-07T11:00:00-03:00');
  assert.equal(nuevo.fin, '2030-01-07T11:20:00-03:00');
  assert.equal(nuevo.estado, 'RESERVADO');
  assert.equal(nuevo.reprogramadoDesdeId, personalizado.id);

  const originalCancelado = agenda.turnos.obtener(original.id);
  const personalizadoCancelado = agenda.turnos.obtener(personalizado.id);

  assert.equal(originalCancelado?.estado, 'CANCELADO');
  assert.equal(originalCancelado?.tipoCancelacion, 'EN_TERMINO');

  assert.equal(personalizadoCancelado?.estado, 'CANCELADO');
  assert.equal(personalizadoCancelado?.tipoCancelacion, 'EN_TERMINO');
  assert.equal(personalizadoCancelado?.duracionMinutos, 30);
  assert.equal(personalizadoCancelado?.reprogramadoDesdeId, original.id);

  assert.deepEqual(agenda.turnos.obtener(nuevo.id), nuevo);
  assert.equal(agenda.turnos.listarPorFecha('2030-01-07').length, 3);
});

test('RN-TU-02: rechaza destinos que no caben en una franja de atención', () => {
  const destinosInvalidos = [
    '2030-01-07T15:50:00-03:00',
    '2030-01-07T16:00:00-03:00',
    '2030-01-08T07:40:00-03:00',
  ];

  for (const destino of destinosInvalidos) {
    const ahora = Date.parse('2030-01-07T08:00:00-03:00');
    const agenda = crearAgendaEnMemoria(datosDemo(ahora), {
      ahora: () => ahora,
    });

    const original = crearTurno(agenda, {
      pacienteId: 'paciente-demo-1',
      prestacionId: 'consulta-general',
      inicio: Date.parse('2030-01-07T09:00:00-03:00'),
    }, () => 'turno-original');

    const originalAntes = { ...original };

    assert.throws(() => reprogramarTurno(agenda, original.id, {
      inicio: Date.parse(destino),
    }, () => 'turno-nuevo'), {
      codigo: 'RN-TU-02',
    }, `Debe rechazar el destino ${destino}`);

    assert.deepEqual(
      agenda.turnos.obtener(original.id),
      originalAntes,
    );

    assert.equal(agenda.turnos.obtener('turno-nuevo'), undefined);
    assert.equal(agenda.turnos.listarPorFecha('2030-01-07').length, 1);
    assert.equal(agenda.turnos.listarPorFecha('2030-01-08').length, 0);
  }
});

test('RN-TU-03: rechaza destinos bloqueados y conserva el turno original', () => {
  const destinosBloqueados = [
    '2030-01-08T12:50:00-03:00',
    '2030-01-08T13:00:00-03:00',
    '2030-01-08T13:10:00-03:00',
  ];

  for (const destino of destinosBloqueados) {
    const ahora = Date.parse('2030-01-07T08:00:00-03:00');
    const agenda = crearAgendaEnMemoria(datosDemo(ahora), {
      ahora: () => ahora,
    });

    const original = crearTurno(agenda, {
      pacienteId: 'paciente-demo-1',
      prestacionId: 'consulta-general',
      inicio: Date.parse('2030-01-07T09:00:00-03:00'),
    }, () => 'turno-original');

    const originalAntes = { ...original };

    assert.throws(() => reprogramarTurno(agenda, original.id, {
      inicio: Date.parse(destino),
    }, () => 'turno-nuevo'), {
      codigo: 'RN-TU-03',
    }, `Debe rechazar el destino bloqueado ${destino}`);

    assert.deepEqual(
      agenda.turnos.obtener(original.id),
      originalAntes,
    );

    assert.equal(agenda.turnos.obtener('turno-nuevo'), undefined);
    assert.equal(agenda.turnos.listarPorFecha('2030-01-07').length, 1);
    assert.equal(agenda.turnos.listarPorFecha('2030-01-08').length, 0);
  }
});

test('RN-TU-04: rechaza destinos pasados o iguales al momento actual', () => {
  const destinosInvalidos = [
    '2030-01-07T09:00:00-03:00',
    '2030-01-07T09:59:00-03:00',
    '2030-01-07T10:00:00-03:00',
  ];

  for (const destino of destinosInvalidos) {
    const ahora = Date.parse('2030-01-07T10:00:00-03:00');
    const agenda = crearAgendaEnMemoria(datosDemo(ahora), {
      ahora: () => ahora,
    });

    const original = crearTurno(agenda, {
      pacienteId: 'paciente-demo-1',
      prestacionId: 'consulta-general',
      inicio: Date.parse('2030-01-07T11:00:00-03:00'),
    }, () => 'turno-original');

    const originalAntes = { ...original };

    assert.throws(() => reprogramarTurno(agenda, original.id, {
      inicio: Date.parse(destino),
    }, () => 'turno-nuevo'), {
      codigo: 'RN-TU-04',
    }, `Debe rechazar el destino ${destino}`);

    assert.deepEqual(
      agenda.turnos.obtener(original.id),
      originalAntes,
    );

    assert.equal(agenda.turnos.obtener('turno-nuevo'), undefined);
    assert.equal(agenda.turnos.listarPorFecha('2030-01-07').length, 1);
  }
});

test('RN-TU-09: rechaza la reprogramación de un turno inexistente', () => {
  const ahora = Date.parse('2030-01-07T08:00:00-03:00');
  const agenda = crearAgendaEnMemoria(datosDemo(ahora), {
    ahora: () => ahora,
  });

  const existente = crearTurno(agenda, {
    pacienteId: 'paciente-demo-1',
    prestacionId: 'consulta-general',
    inicio: Date.parse('2030-01-07T09:00:00-03:00'),
  }, () => 'turno-existente');

  const existenteAntes = { ...existente };

  assert.throws(() => reprogramarTurno(agenda, 'turno-inexistente', {
    inicio: Date.parse('2030-01-07T10:00:00-03:00'),
  }, () => 'turno-nuevo'), {
    codigo: 'TURNO_INEXISTENTE',
  });

  assert.equal(
    agenda.turnos.obtener('turno-inexistente'),
    undefined,
  );

  assert.equal(
    agenda.turnos.obtener('turno-nuevo'),
    undefined,
  );

  assert.deepEqual(
    agenda.turnos.obtener(existente.id),
    existenteAntes,
  );

  assert.equal(agenda.turnos.listarPorFecha('2030-01-07').length, 1);
});

test('RN-TU-09: rechaza la reprogramación de un turno que ya comenzó', () => {
  const momentosInvalidos = [
    '2030-01-07T09:00:00-03:00',
    '2030-01-07T09:10:00-03:00',
  ];

  for (const momento of momentosInvalidos) {
    let ahora = Date.parse('2030-01-07T08:00:00-03:00');

    const agenda = crearAgendaEnMemoria(datosDemo(ahora), {
      ahora: () => ahora,
    });

    const original = crearTurno(agenda, {
      pacienteId: 'paciente-demo-1',
      prestacionId: 'consulta-general',
      inicio: Date.parse('2030-01-07T09:00:00-03:00'),
    }, () => 'turno-original');

    const originalAntes = { ...original };

    // Avanzar el reloj hasta el inicio del turno o después.
    ahora = Date.parse(momento);

    assert.throws(() => reprogramarTurno(agenda, original.id, {
      inicio: Date.parse('2030-01-07T11:00:00-03:00'),
    }, () => 'turno-nuevo'), {
      codigo: 'RN-TU-09',
    }, `Debe rechazar la reprogramación a las ${momento}`);

    assert.deepEqual(
      agenda.turnos.obtener(original.id),
      originalAntes,
    );

    assert.equal(agenda.turnos.obtener('turno-nuevo'), undefined);
    assert.equal(agenda.turnos.listarPorFecha('2030-01-07').length, 1);
  }
});