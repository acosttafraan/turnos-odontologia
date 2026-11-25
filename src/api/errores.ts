import { ReglaNegocioError } from '../agenda/errores.ts';

const codigosDeConflicto = new Set(['RN-TU-01', 'RN-TU-03', 'RN-TU-10', 'RN-AG-03']);

export class ErrorHttp extends Error {
  readonly estado: number;
  readonly codigo: string;

  constructor(estado: number, codigo: string, mensaje: string) {
    super(mensaje);
    this.estado = estado;
    this.codigo = codigo;
  }
}

export function respuestaError(error: unknown) {
  if (error instanceof ReglaNegocioError) {
    return {
      estado: codigosDeConflicto.has(error.codigo) ? 409 : 422,
      cuerpo: { codigo: error.codigo, mensaje: error.message, detalle: error.detalle },
    };
  }

  if (error instanceof ErrorHttp) {
    return { estado: error.estado, cuerpo: { codigo: error.codigo, mensaje: error.message, detalle: null } };
  }

  console.error('Error inesperado al procesar la solicitud.');
  return {
    estado: 500,
    cuerpo: { codigo: 'ERROR_INTERNO', mensaje: 'Ocurrió un error interno.', detalle: null },
  };
}
