import { ReglaNegocioError } from './errores.ts';
import type { EstadoTurno, TipoCancelacion, Turno } from './tipos.ts';

const destinos: Record<EstadoTurno, readonly EstadoTurno[]> = {
  RESERVADO: ['CONFIRMADO', 'CANCELADO', 'ASISTIO', 'AUSENTE'],
  CONFIRMADO: ['CANCELADO', 'ASISTIO', 'AUSENTE'],
  CANCELADO: [],
  ASISTIO: [],
  AUSENTE: [],
};

export function esActivo(estado: EstadoTurno): boolean {
  return estado === 'RESERVADO' || estado === 'CONFIRMADO';
}

export function transicionarEstado(
  turno: Turno,
  destino: EstadoTurno,
  opciones: { actualizadoEn?: string; canceladoEn?: string; tipo?: TipoCancelacion } = {},
): Turno {
  if (!destinos[turno.estado].includes(destino)) {
    throw new ReglaNegocioError('RN-TU-08', 'La transición de estado no está permitida.');
  }

  const actualizado = { ...turno, estado: destino, actualizadoEn: opciones.actualizadoEn ?? turno.actualizadoEn };
  if (destino === 'CANCELADO') {
    if (opciones.canceladoEn !== undefined) actualizado.canceladoEn = opciones.canceladoEn;
    if (opciones.tipo !== undefined) actualizado.tipoCancelacion = opciones.tipo;
  }
  return actualizado;
}
