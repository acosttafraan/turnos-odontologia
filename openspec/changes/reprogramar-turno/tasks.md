# Tareas: reprogramar-turno

- [x] 1. Confirmar con el líder la política de duración por defecto de la reprogramación: utilizar la duración de la prestación cuando no se envía `duracionMinutos`, conforme a RN-TU-05.
- [x] 2. Revisar los puertos y el caso de uso de creación de C-07 para reutilizar validaciones sin contar el turno original en RN-TU-01.
- [x] 3. Implementar el caso de uso de reprogramación, calculando datos antes de la primera escritura y preservando el original ante cualquier error.
- [x] 4. Garantizar en el caso de uso un tramo síncrono sin `await` entre la comprobación de solapamiento y las escrituras (RN-TU-10). Si los puertos existentes no lo permiten, coordinar el cambio necesario con el dueño de C-07 antes de modificar contratos.
- [ ] 5. Implementar la ruta `PUT /api/v1/turnos/{id}/reprogramar` y mapear respuestas 200, 404, 409 y 422.
- [ ] 6. Cubrir cada escenario del spec con pruebas identificadas por su código RN.
- [ ] 7. Agregar al README la sección “Cómo probar: reprogramar un turno”.