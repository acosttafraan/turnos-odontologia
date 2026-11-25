import { createServer } from 'node:http';
import type { IncomingMessage } from 'node:http';
import { ErrorHttp, respuestaError } from './errores.ts';

export const LIMITE_JSON = 16 * 1024;

type Respuesta = { estado: number; cuerpo: unknown };
export type Parametros = Record<string, string>;
type Manejador = (solicitud: IncomingMessage, url: URL, params: Parametros) => Respuesta | Promise<Respuesta>;
type RutaConParametros = { metodo: string; segmentos: string[]; manejar: Manejador };

function segmentosDe(ruta: string): string[] {
  return ruta.split('/').slice(1);
}

// Devuelve los parámetros si la ruta coincide con el patrón (segmentos `:nombre`), o undefined.
function coincidir(patron: string[], ruta: string[]): Parametros | undefined {
  if (patron.length !== ruta.length) return undefined;
  const params: Parametros = {};
  for (let i = 0; i < patron.length; i++) {
    if (patron[i].startsWith(':')) {
      if (ruta[i] === '') return undefined;
      try {
        params[patron[i].slice(1)] = decodeURIComponent(ruta[i]);
      } catch {
        return undefined;
      }
    } else if (patron[i] !== ruta[i]) {
      return undefined;
    }
  }
  return params;
}

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
  const rutasConParametros: RutaConParametros[] = [];

  function buscar(metodo: string, ruta: string): { manejar: Manejador; params: Parametros } | undefined {
    const exacta = rutas.get(metodo + ' ' + ruta);
    if (exacta) return { manejar: exacta, params: {} };
    const segmentos = segmentosDe(ruta);
    for (const candidata of rutasConParametros) {
      if (candidata.metodo !== metodo) continue;
      const params = coincidir(candidata.segmentos, segmentos);
      if (params) return { manejar: candidata.manejar, params };
    }
    return undefined;
  }

  const servidor = createServer(async (solicitud, respuesta) => {
    let resultado: Respuesta;
    try {
      const url = new URL(solicitud.url ?? '/', 'http://127.0.0.1');
      const encontrada = buscar(solicitud.method ?? '', url.pathname);
      if (!encontrada) throw new ErrorHttp(404, 'RUTA_INEXISTENTE', 'La ruta no existe.');
      resultado = await encontrada.manejar(solicitud, url, encontrada.params);
    } catch (error) {
      resultado = respuestaError(error);
    }

    respuesta.setHeader('Content-Type', 'application/json; charset=utf-8');
    if (resultado.estado === 413) respuesta.setHeader('Connection', 'close');
    respuesta.writeHead(resultado.estado);
    respuesta.end(JSON.stringify(resultado.cuerpo));
  });

  return {
    servidor,
    registrar(metodo: string, ruta: string, manejar: Manejador) {
      if (ruta.includes('/:')) {
        rutasConParametros.push({ metodo, segmentos: segmentosDe(ruta), manejar });
      } else {
        rutas.set(metodo + ' ' + ruta, manejar);
      }
    },
  };
}
