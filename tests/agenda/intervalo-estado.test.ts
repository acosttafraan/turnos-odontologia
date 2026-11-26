import assert from 'node:assert/strict';
import { test } from 'node:test';
import { seSuperponen } from '../../src/agenda/intervalo.ts';
import { transicionarEstado } from '../../src/agenda/estado.ts';
import type { EstadoTurno, Turno } from '../../src/agenda/tipos.ts';

const turno: Turno = {
  id: 'turno-demo', consultorioId: 'consultorio-demo', pacienteId: 'paciente-demo-1',
  prestacionId: 'consulta-general', inicio: '2040-01-02T08:00:00-03:00',
  fin: '2040-01-02T08:20:00-03:00', duracionMinutos: 20,
  estado: 'RESERVADO', creadoEn: '2040-01-01T08:00:00-03:00',
  actualizadoEn: '2040-01-01T08:00:00-03:00',
};

test('RN-TU-01: los intervalos semiabiertos permiten contacto y rechazan intersección', () => {
  assert.equal(seSuperponen({ inicio: 10, fin: 20 }, { inicio: 20, fin: 30 }), false);
  assert.equal(seSuperponen({ inicio: 20, fin: 30 }, { inicio: 10, fin: 20 }), false);
  assert.equal(seSuperponen({ inicio: 10, fin: 20 }, { inicio: 15, fin: 25 }), true);
  assert.equal(seSuperponen({ inicio: 10, fin: 20 }, { inicio: 11, fin: 12 }), true);
});

test('RN-TU-08: permite las transiciones definidas y protege los estados finales', () => {
  const finales: EstadoTurno[] = ['CANCELADO', 'ASISTIO', 'AUSENTE'];
  const confirmado = transicionarEstado(turno, 'CONFIRMADO');
  for (const destino of finales) {
    assert.equal(transicionarEstado(turno, destino).estado, destino);
    assert.equal(transicionarEstado(confirmado, destino).estado, destino);
    const final = transicionarEstado(turno, destino);
    for (const otro of ['RESERVADO', 'CONFIRMADO', ...finales] as EstadoTurno[]) {
      assert.throws(() => transicionarEstado(final, otro), { codigo: 'RN-TU-08' });
    }
  }
  assert.equal(confirmado.estado, 'CONFIRMADO');
  assert.equal(turno.estado, 'RESERVADO');
  assert.throws(() => transicionarEstado(confirmado, 'RESERVADO'), { codigo: 'RN-TU-08' });
});
