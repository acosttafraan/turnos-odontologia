import { once } from 'node:events';
import type { Server } from 'node:http';
import type { TestContext } from 'node:test';

export async function escuchar(t: TestContext, servidor: Server) {
  servidor.listen(0, '127.0.0.1');
  await once(servidor, 'listening');
  t.after(() => new Promise<void>((resolve, reject) => {
    servidor.close(error => error ? reject(error) : resolve());
  }));
  const direccion = servidor.address();
  if (!direccion || typeof direccion === 'string') throw new Error('Se esperaba una dirección TCP');
  return { url: 'http://127.0.0.1:' + direccion.port, direccion };
}
