import assert from 'node:assert/strict';
import { test } from 'node:test';
import { crearTurno } from '../../src/agenda/crear-turno.ts';
import { crearAgendaEnMemoria } from '../../src/infra/memoria.ts';
import { datosDemo } from '../../src/infra/semilla.ts';

test('RN-TU-07/04/02: respeta la precedencia de referencias, reloj y franja', () => {
  const ahora = Date.parse('2030-01-07T08:00:00-03:00');
  const agenda = crearAgendaEnMemoria(datosDemo(ahora), { ahora: () => ahora });
  const entrada = {
    pacienteId: 'inexistente', prestacionId: 'consulta-general',
    inicio: Date.parse('2030-01-07T07:00:00-03:00'),
  };
  const generarId = () => 'turno-nuevo';
  assert.throws(() => crearTurno(agenda, entrada, generarId), { codigo: 'RN-TU-07' });
  const conPaciente = { ...entrada, pacienteId: 'paciente-demo-1' };
  assert.throws(() => crearTurno(agenda, conPaciente, generarId), { codigo: 'RN-TU-04' });
  const fueraDeFranja = { ...conPaciente, inicio: Date.parse('2030-01-07T16:10:00-03:00') };
  assert.throws(() => crearTurno(agenda, fueraDeFranja, generarId), { codigo: 'RN-TU-02' });
  assert.deepEqual(agenda.turnos.listarPorFecha('2030-01-07'), []);
});
