export class ReglaNegocioError extends Error {
  readonly codigo: string;
  readonly detalle: unknown;

  constructor(codigo: string, mensaje: string, detalle: unknown = null) {
    super(mensaje);
    this.codigo = codigo;
    this.detalle = detalle;
  }
}
