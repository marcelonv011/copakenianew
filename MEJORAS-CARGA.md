# Equipos y resultados

- En la pestaña Equipos del torneo, buscar por nombre, club o ciudad; seleccionar varios equipos y agregarlos juntos. Se muestra todo el catálogo disponible, sin el límite anterior de diez equipos. Las selecciones se conservan al cambiar la búsqueda. La inscripción utiliza `arrayUnion` para evitar duplicados por ID y conservar inscripciones simultáneas de otros administradores.
- Los equipos nuevos se siguen creando en el catálogo Equipos, accesible desde el enlace del selector. No se cambian categorías ni la asignación de zonas.
- En Fixture o Resultados, usar Cargar resultado / Editar resultado. Solo se completan los dos marcadores; se muestra el ganador y se finaliza el partido al guardar. Los partidos en curso también aparecen en Fixture.
- Ante un error se conservan los datos. Mientras se guarda, los controles del formulario de resultado y del selector quedan bloqueados.

Se conservan los cálculos existentes de puntuación, desempates, posiciones y playoffs. El guardado rápido solo modifica `home_score`, `away_score` y `status` del partido.

## Verificación

`node --test src/lib/tournamentEntry.test.js` comprueba búsqueda, exclusión de inscritos, disponibilidad después del décimo equipo y validación de marcadores. `npm run build` verifica la compilación.

El análisis global de ESLint tiene errores preexistentes en otros archivos. No se han reformado esas pantallas como parte de este cambio.

La prueba de escritura real requiere las variables `VITE_FIREBASE_*` de `src/firebase/config.js` y una cuenta administradora. No se dispone de esa configuración en el repositorio y no se modificaron datos remotos para probar. Pendiente de verificación manual: inscribir varios equipos en un torneo de prueba, guardar y editar resultados, simular un fallo de red y revisar la vista móvil.
