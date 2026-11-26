import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cancelarTurno } from '../../src/agenda/cancelar-turno.ts';
import type { EstadoTurno, Turno } from '../../src/agenda/tipos.ts';
import { crearAgendaEnMemoria } from '../../src/infra/memoria.ts';
import { datosDemo } from '../../src/infra/semilla.ts';

// Datos ficticios (RN-DA-01). El turno de prueba empieza siempre a esta hora.
const INICIO = '2030-01-09T10:00:00-03:00';
const FIN = '2030-01-09T10:20:00-03:00';
const CREADO = '2030-01-01T09:00:00-03:00';

function turno(estado: EstadoTurno, extra: Partial<Turno> = {}): Turno {
  return {
    id: 'turno-1', consultorioId: 'consultorio-demo', pacienteId: 'paciente-demo-1',
    prestacionId: 'consulta-general', inicio: INICIO, fin: FIN, duracionMinutos: 20,
    estado, creadoEn: CREADO, actualizadoEn: CREADO, ...extra,
  };
}

// Arma una agenda en memoria con un turno y el reloj fijo en `ahora` (ISO con offset).
function agendaCon(t: Turno, ahora: string) {
  const instante = Date.parse(ahora);
  return crearAgendaEnMemoria({ ...datosDemo(instante), turnos: [t] }, { ahora: () => instante });
}

test('C10-01 RN-CA-01: cancelar un turno reservado con 48 h de anticipación es en término', () => {
  const agenda = agendaCon(turno('RESERVADO'), '2030-01-07T10:00:00-03:00');
  const cancelado = cancelarTurno(agenda, 'turno-1');
  assert.equal(cancelado?.estado, 'CANCELADO');
  assert.equal(cancelado?.tipoCancelacion, 'EN_TERMINO');
  assert.equal(cancelado?.canceladoEn, '2030-01-07T10:00:00-03:00');
  assert.equal(cancelado?.actualizadoEn, '2030-01-07T10:00:00-03:00');
  assert.deepEqual(agenda.turnos.obtener('turno-1'), cancelado);
});

test('C10-02 RN-CA-03: un turno confirmado se puede cancelar', () => {
  const agenda = agendaCon(turno('CONFIRMADO'), '2030-01-06T10:00:00-03:00');
  assert.equal(cancelarTurno(agenda, 'turno-1')?.estado, 'CANCELADO');
});

test('C10-03 RN-CA-01: cancelar con exactamente 24 h de anticipación es en término (borde)', () => {
  const agenda = agendaCon(turno('RESERVADO'), '2030-01-08T10:00:00-03:00');
  assert.equal(cancelarTurno(agenda, 'turno-1')?.tipoCancelacion, 'EN_TERMINO');
});

test('C10-04 RN-CA-01: cancelar con 23 h 59 min de anticipación es tardía (borde)', () => {
  const agenda = agendaCon(turno('RESERVADO'), '2030-01-08T10:01:00-03:00');
  assert.equal(cancelarTurno(agenda, 'turno-1')?.tipoCancelacion, 'TARDIA');
});

test('C10-05 RN-CA-01: cancelar 2 h antes del inicio es tardía', () => {
  const agenda = agendaCon(turno('RESERVADO'), '2030-01-09T08:00:00-03:00');
  assert.equal(cancelarTurno(agenda, 'turno-1')?.tipoCancelacion, 'TARDIA');
});

test('C10-05 RN-CF-02: la clasificación usa la anticipación configurada en la agenda', () => {
  const instante = Date.parse('2030-01-08T10:00:00-03:00');
  const datos = { ...datosDemo(instante), turnos: [turno('RESERVADO')] };
  datos.consultorio.anticipacionCancelacionHoras = 48;
  const agenda = crearAgendaEnMemoria(datos, { ahora: () => instante });
  assert.equal(cancelarTurno(agenda, 'turno-1')?.tipoCancelacion, 'TARDIA');
});

test('C10-06 RN-CA-04: un turno cancelado tarde queda cancelado y nunca ausente', () => {
  const agenda = agendaCon(turno('RESERVADO'), '2030-01-09T09:30:00-03:00');
  cancelarTurno(agenda, 'turno-1');
  const guardado = agenda.turnos.obtener('turno-1');
  assert.equal(guardado?.estado, 'CANCELADO');
  assert.equal(guardado?.tipoCancelacion, 'TARDIA');
  assert.notEqual(guardado?.estado, 'AUSENTE');
});

test('C10-08 RN-CA-03: cancelar un turno que ya empezó se rechaza y el turno no cambia', () => {
  const original = turno('RESERVADO');
  const agenda = agendaCon(original, '2030-01-09T10:10:00-03:00');
  assert.throws(() => cancelarTurno(agenda, 'turno-1'), { codigo: 'RN-CA-03' });
  assert.deepEqual(agenda.turnos.obtener('turno-1'), original);
});

test('C10-09 RN-CA-03: cancelar en el instante exacto de inicio se rechaza (borde)', () => {
  const agenda = agendaCon(turno('RESERVADO'), INICIO);
  assert.throws(() => cancelarTurno(agenda, 'turno-1'), { codigo: 'RN-CA-03' });
});

test('C10-10 RN-CA-03: cancelar un turno ya cancelado se rechaza sin cambiar la cancelación original', () => {
  const original = turno('CANCELADO', { tipoCancelacion: 'TARDIA', canceladoEn: '2030-01-09T09:00:00-03:00' });
  const agenda = agendaCon(original, '2030-01-07T10:00:00-03:00');
  assert.throws(() => cancelarTurno(agenda, 'turno-1'), { codigo: 'RN-CA-03' });
  assert.deepEqual(agenda.turnos.obtener('turno-1'), original);
});

for (const estado of ['ASISTIO', 'AUSENTE'] as const) {
  test('C10-11 RN-CA-03: cancelar un turno ' + estado + ' se rechaza', () => {
    const original = turno(estado);
    const agenda = agendaCon(original, '2030-01-07T10:00:00-03:00');
    assert.throws(() => cancelarTurno(agenda, 'turno-1'), { codigo: 'RN-CA-03' });
    assert.deepEqual(agenda.turnos.obtener('turno-1'), original);
  });
}

test('C10-13: un turno inexistente devuelve undefined sin guardar nada', () => {
  const agenda = agendaCon(turno('RESERVADO'), '2030-01-07T10:00:00-03:00');
  assert.equal(cancelarTurno(agenda, 'no-existe'), undefined);
  assert.equal(agenda.turnos.obtener('no-existe'), undefined);
});
