import { ReglaNegocioError } from './errores.ts';
import { esActivo, transicionarEstado } from './estado.ts';
import { isoLocal, MINUTO } from './fecha.ts';
import type { Agenda } from './puertos.ts';
import type { TipoCancelacion, Turno } from './tipos.ts';

const HORA = 60 * MINUTO;

// Cancela un turno vigente (RN-CA-01 a RN-CA-04). Devuelve undefined si el turno no existe.
// Es síncrono de punta a punta: leer, verificar y guardar ocurren sin `await` (RN-TU-10).
export function cancelarTurno(agenda: Agenda, turnoId: string): Turno | undefined {
  const turno = agenda.turnos.obtener(turnoId);
  if (!turno) return undefined;

  const ahora = agenda.reloj.ahora();
  const inicio = Date.parse(turno.inicio);
  if (!esActivo(turno.estado) || ahora >= inicio) {
    throw new ReglaNegocioError(
      'RN-CA-03',
      'Solo se pueden cancelar turnos reservados o confirmados que todavía no empezaron.',
      { estado: turno.estado, inicio: turno.inicio },
    );
  }

  const anticipacion = inicio - ahora;
  const tipo: TipoCancelacion =
    anticipacion >= agenda.anticipacionCancelacionHoras * HORA ? 'EN_TERMINO' : 'TARDIA';
  const momento = isoLocal(ahora);
  const cancelado = transicionarEstado(turno, 'CANCELADO', {
    tipo, canceladoEn: momento, actualizadoEn: momento,
  });
  agenda.turnos.guardar(cancelado);
  return cancelado;
}
