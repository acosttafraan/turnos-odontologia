import { createServer } from 'node:http';
import type { IncomingMessage } from 'node:http';
import { ErrorHttp, respuestaError } from './errores.ts';

export const LIMITE_JSON = 16 * 1024;

type Respuesta = { estado: number; cuerpo: unknown; tipo?: undefined } |
  { estado: number; cuerpo: string; tipo: string };
type Manejador = (solicitud: IncomingMessage, url: URL) => Respuesta | Promise<Respuesta>;

export async function leerJson(solicitud: IncomingMessage): Promise<unknown> {
  const partes: Buffer[] = [];
  let bytes = 0;
  for await (const parte of solicitud.iterator({ destroyOnReturn: false })) {
    const fragmento = Buffer.from(parte);
    bytes += fragmento.length;
    if (bytes > LIMITE_JSON) {
      solicitud.resume();
      throw new ErrorHttp(413, 'CUERPO_DEMASIADO_GRANDE', 'El cuerpo supera el límite permitido.');
    }
    partes.push(fragmento);
  }

  try {
    return JSON.parse(Buffer.concat(partes).toString('utf8'));
  } catch {
    throw new ErrorHttp(422, 'JSON_INVALIDO', 'El cuerpo debe ser JSON válido.');
  }
}

export function crearRouter() {
  const rutas = new Map<string, Manejador>();
  const servidor = createServer(async (solicitud, respuesta) => {
    let resultado: Respuesta;
    try {
      const url = new URL(solicitud.url ?? '/', 'http://127.0.0.1');
      const manejar = rutas.get(solicitud.method + ' ' + url.pathname);
      if (!manejar) throw new ErrorHttp(404, 'RUTA_INEXISTENTE', 'La ruta no existe.');
      resultado = await manejar(solicitud, url);
    } catch (error) {
      resultado = respuestaError(error);
    }

    respuesta.setHeader('Content-Type', resultado.tipo ?? 'application/json; charset=utf-8');
    if (resultado.estado === 413) respuesta.setHeader('Connection', 'close');
    respuesta.writeHead(resultado.estado);
    respuesta.end(resultado.tipo === undefined ? JSON.stringify(resultado.cuerpo) : resultado.cuerpo);
  });

  return {
    servidor,
    registrar(metodo: string, ruta: string, manejar: Manejador) {
      rutas.set(metodo + ' ' + ruta, manejar);
    },
  };
}
