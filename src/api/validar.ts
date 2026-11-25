import { esFechaValida } from '../agenda/fecha.ts';
import { ErrorHttp } from './errores.ts';

export function leerFecha(url: URL): string {
  const fecha = url.searchParams.get('fecha');
  if (fecha === null || !esFechaValida(fecha)) {
    throw new ErrorHttp(422, 'FECHA_INVALIDA', 'Indicá una fecha válida en formato AAAA-MM-DD.');
  }
  return fecha;
}
