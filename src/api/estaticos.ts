import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import type { crearRouter } from './router.ts';

const recursos = [
  ['agenda.html', 'text/html'],
  ['agenda.css', 'text/css'],
  ['agenda.ts', 'text/javascript'],
  ['agenda-vista.ts', 'text/javascript'],
] as const;

export function registrarEstaticos(router: ReturnType<typeof crearRouter>) {
  for (const [archivo, tipo] of recursos) {
    const origen = new URL('../web/' + archivo, import.meta.url);
    router.registrar('GET', '/' + archivo, async () => {
      const contenido = await readFile(origen, 'utf8');
      return {
        estado: 200,
        tipo: tipo + '; charset=utf-8',
        cuerpo: tipo === 'text/javascript' ? stripTypeScriptTypes(contenido) : contenido,
      };
    });
  }
}
