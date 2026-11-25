import { crearServidor, HOST_LOCAL } from './api/servidor.ts';
import { crearAgendaEnMemoria } from './infra/memoria.ts';
import { datosDemo } from './infra/semilla.ts';

const host = process.env.HOST ?? HOST_LOCAL;
const puerto = Number(process.env.PORT ?? '3000');

if (host !== HOST_LOCAL) throw new Error('HOST debe ser 127.0.0.1.');
if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535) {
  throw new Error('PORT debe ser un entero entre 1 y 65535.');
}

const reloj = { ahora: Date.now };
const agenda = crearAgendaEnMemoria(datosDemo(reloj.ahora()), reloj);
const servidor = crearServidor(agenda);

function cerrar() {
  servidor.close(error => {
    if (error) {
      console.error('Error al cerrar el servidor.');
      process.exitCode = 1;
    }
  });
}

process.once('SIGINT', cerrar);
process.once('SIGTERM', cerrar);
process.once('unhandledRejection', () => {
  console.error('Error asíncrono inesperado.');
  process.exitCode = 1;
  cerrar();
});

servidor.listen(puerto, host, () => {
  console.log('API local en http://' + host + ':' + puerto);
});
