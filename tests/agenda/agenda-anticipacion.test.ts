import assert from 'node:assert/strict';
import { test } from 'node:test';
import { crearAgendaEnMemoria } from '../../src/infra/memoria.ts';
import { datosDemo } from '../../src/infra/semilla.ts';

test('C10 D7 RN-CF-02: la agenda expone la anticipación mínima de cancelación de la semilla', () => {
  const ahora = Date.parse('2030-01-06T00:00:00-03:00');
  const agenda = crearAgendaEnMemoria(datosDemo(ahora), { ahora: () => ahora });
  assert.equal(agenda.anticipacionCancelacionHoras, 24);
});

test('C10 D7 RN-CF-02: la agenda respeta una anticipación configurada distinta', () => {
  const ahora = Date.parse('2030-01-06T00:00:00-03:00');
  const datos = datosDemo(ahora);
  datos.consultorio.anticipacionCancelacionHoras = 48;
  const agenda = crearAgendaEnMemoria(datos, { ahora: () => ahora });
  assert.equal(agenda.anticipacionCancelacionHoras, 48);
});
