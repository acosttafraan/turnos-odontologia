import assert from 'node:assert/strict';
import { test } from 'node:test';
import { crearRouter, leerJson, LIMITE_JSON } from '../../src/api/router.ts';
import { iniciarAgenda } from './agenda-prueba.ts';
import { escuchar } from './servidor-prueba.ts';

test('el router rechaza JSON por encima del límite antes de invocar el caso de uso', async t => {
  let invocaciones = 0;
  const servidor = crearRouter();
  servidor.registrar('POST', '/prueba', async solicitud => {
    await leerJson(solicitud);
    invocaciones++;
    return { estado: 201, cuerpo: {} };
  });
  const { url } = await escuchar(t, servidor.servidor);
  const cuerpo = JSON.stringify({ valor: 'a'.repeat(LIMITE_JSON) });
  const respuesta = await fetch(url + '/prueba', { method: 'POST', body: cuerpo });
  assert.equal(respuesta.status, 413);
  assert.equal((await respuesta.json()).codigo, 'CUERPO_DEMASIADO_GRANDE');
  assert.equal(invocaciones, 0);
});

test('C07-01 RN-DA-01/02: salud HTTP y escucha local', async t => {
  const { url, direccion } = await iniciarAgenda(t);
  assert.equal(direccion.address, '127.0.0.1');
  const respuesta = await fetch(url + '/api/v1/health');
  assert.equal(respuesta.status, 200);
  assert.deepEqual(await respuesta.json(), { estado: 'ok' });
});
