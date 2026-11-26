## Context

C-07 ya ofrece el servidor local y `GET /api/v1/turnos?fecha=AAAA-MM-DD`, con paciente, prestación y estado. C-17 se implementó sobre `master` en `4814316`, que integra el PR #1.

## Goals / Non-Goals

Mostrar la jornada del consultorio en hora de Buenos Aires mediante una página de solo lectura. La agenda semanal, las acciones sobre turnos y la autenticación quedan fuera del alcance.

## Decisions

### PA-13 · TypeScript servido como JavaScript

Node elimina los tipos con `node:module.stripTypeScriptTypes`. Los módulos conservan las URL con extensión `.ts` y se entregan con el tipo `text/javascript`. El router registra cuatro rutas GET exactas, cada una asociada a un archivo fijo de `src/web/`. Se mantiene el stack sin dependencias npm.

### Lectura de franjas y bloqueos

La pantalla conserva el listado diario de C-07 y consulta `GET /api/v1/agenda-diaria?fecha=AAAA-MM-DD` en paralelo. Esta ruta reutiliza la validación de fecha, las franjas y los repositorios de C-07. Devuelve `{ franjas, bloqueos }`, con horas ISO y bloqueos recortados a los límites de la jornada. La forma de las respuestas existentes se conserva.

### Presentación

La fecha inicial corresponde al calendario de Buenos Aires. La navegación mueve la fecha un día de calendario. La vista ordena por instante, formatea las horas en la zona del consultorio e inserta los datos como texto en listas y una tabla semántica. Las solicitudes anteriores se cancelan al cambiar de fecha. Los fallos de la API muestran el código y mensaje en una alerta accesible.

## Risks / Trade-offs

La API de borrado de tipos es experimental en Node. Se usa únicamente para los dos módulos TypeScript de la agenda. El servidor utiliza datos ficticios y escucha en la dirección local definida por C-07.
