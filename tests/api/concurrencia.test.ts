import assert from 'node:assert/strict';
import { test } from 'node:test';
import { hora, iniciarAgenda } from './agenda-prueba.ts';

test('C07-15 RN-TU-10/RN-TU-01: dos pacientes reservan y solo uno obtiene el horario', async t => {
  const app = await iniciarAgenda(t);
  const inicio = hora('08:00');
  const consultas = await Promise.all([app.disponibilidad(), app.disponibilidad()]);
  for (const consulta of consultas) {
    assert.equal(consulta.status, 200);
    const horarios = await consulta.json();
    assert.deepEqual(horarios[0], { inicio, fin: hora('08:20') });
  }

  const pacientes = ['paciente-demo-1', 'paciente-demo-2'];
  const respuestas = await Promise.all(pacientes.map(pacienteId => app.reservar(inicio, { pacienteId })));
  assert.deepEqual(respuestas.map(({ status }) => status).sort(), [201, 409]);

  const ganador = respuestas.findIndex(({ status }) => status === 201);
  const creado = await respuestas[ganador].json();
  assert.equal(creado.pacienteId, pacientes[ganador]);
  assert.equal(creado.estado, 'RESERVADO');
  const conflicto = await respuestas[1 - ganador].json();
  assert.equal(conflicto.codigo, 'RN-TU-01');
  assert.match(conflicto.mensaje, /elegí otro horario/i);

  const agenda = await app.agendaDiaria();
  assert.equal(agenda.status, 200);
  const turnos = await agenda.json();
  assert.equal(turnos.length, 1);
  assert.equal(turnos[0].id, creado.id);
  assert.equal(turnos[0].paciente.id, pacientes[ganador]);
});
