import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { setImmediate } from 'node:timers/promises';
import { test } from 'node:test';

test('C-17: la alerta muestra el código RN y el mensaje devueltos por la API', async t => {
  const html = await readFile(new URL('../../src/web/agenda.html', import.meta.url), 'utf8');
  const alertaId = html.match(/<p id="([^"]+)" role="alert">/)?.[1];
  assert.ok(alertaId, 'La pantalla debe tener una región de alerta');

  const nodos = new Map([...html.matchAll(/\bid="([^"]+)"/g)].map(([, id]) => [
    '#' + id, { textContent: '', hidden: false, addEventListener() {} },
  ]));
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', {
    configurable: true, value: { querySelector: (selector: string) => nodos.get(selector) ?? null },
  });
  t.after(() => {
    if (descriptor) Object.defineProperty(globalThis, 'document', descriptor);
    else Reflect.deleteProperty(globalThis, 'document');
  });

  const consultar = t.mock.method(globalThis, 'fetch', async (url: string) => {
    const { pathname } = new URL(url, 'http://127.0.0.1');
    assert.ok(['/api/v1/turnos', '/api/v1/agenda-diaria'].includes(pathname));
    return pathname === '/api/v1/turnos'
      ? Response.json({ codigo: 'RN-TU-02', mensaje: 'El turno está fuera del horario de atención.' }, { status: 422 })
      : Response.json({ franjas: [], bloqueos: [] });
  });

  await import('../../src/web/agenda.ts');
  await setImmediate();

  assert.equal(consultar.mock.callCount(), 2);
  assert.equal(nodos.get('#' + alertaId)?.textContent, 'RN-TU-02 · El turno está fuera del horario de atención.');
  assert.equal(nodos.get('#jornada')?.hidden, true);
  assert.equal(nodos.get('#estado')?.textContent, '');
});
