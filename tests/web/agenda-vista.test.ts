import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fechaConsultorio, moverFecha, prepararDia } from '../../src/web/agenda-vista.ts';

const fecha = '2030-01-07';
const intervalo = (inicio: string, fin: string) => ({
  inicio: fecha + 'T' + inicio + ':00Z', fin: fecha + 'T' + fin + ':00Z',
});
const datosTurno = {
  paciente: { nombre: 'Paciente 1', apellido: 'Demo' },
  prestacion: { nombre: 'Consulta general' }, estado: 'RESERVADO',
};

test('C-17 RN-CF-01: ordena dos turnos y muestra la jornada en Buenos Aires', () => {
  const dia = prepararDia([intervalo('11:00', '19:00')],
    [{ ...intervalo('16:00', '16:20'), motivo: 'Bloqueo de ejemplo' }],
    [{ ...datosTurno, ...intervalo('14:00', '14:20'), estado: 'CANCELADO' },
     { ...datosTurno, ...intervalo('12:00', '12:20') }], fecha);
  assert.deepEqual(dia.franjas, ['08:00 – 16:00']);
  assert.deepEqual(dia.bloqueos, [{ horario: '13:00 – 13:20', motivo: 'Bloqueo de ejemplo' }]);
  assert.deepEqual(dia.filas, [
    { horario: '09:00 – 09:20', paciente: 'Paciente 1 Demo', prestacion: 'Consulta general', estado: 'Reservado' },
    { horario: '11:00 – 11:20', paciente: 'Paciente 1 Demo', prestacion: 'Consulta general', estado: 'Cancelado' },
  ]);
});

test('C-17 RN-TU-01: conserva dos turnos contiguos como filas distintas', () => {
  const dia = prepararDia([], [], [
    { ...datosTurno, ...intervalo('12:30', '13:00') },
    { ...datosTurno, ...intervalo('12:00', '12:30') },
  ], fecha);
  assert.deepEqual(dia.filas.map(fila => fila.horario), ['09:00 – 09:30', '09:30 – 10:00']);
});

test('C-17 RN-AG-01: distingue un día sin atención de uno sin turnos', () => {
  assert.equal(prepararDia([], [], [], fecha).mensajeFranjas, 'Sin atención');
  const dia = prepararDia([intervalo('11:00', '19:00')], [], [], fecha);
  assert.equal(dia.mensajeFranjas, '');
  assert.match(dia.mensajeTurnos, /No hay turnos/);
});

test('C-17 RN-CF-01: calcula hoy en Buenos Aires y navega al cambiar de mes', () => {
  assert.equal(fechaConsultorio(Date.parse('2030-02-01T02:00:00Z')), '2030-01-31');
  assert.equal(moverFecha('2030-01-31', 1), '2030-02-01');
  assert.equal(moverFecha('2030-02-01', -1), '2030-01-31');
});
