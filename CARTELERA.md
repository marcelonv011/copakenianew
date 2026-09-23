# Cartelera, imágenes y QR

En cada torneo hay un botón **Ver cartelera · Imagen y QR**. Abre `/cartelera/:id`, una vista sin formulario de ingreso que escucha los cambios de partidos en Firestore.

- Antes del cierre se muestran el horario, los equipos, la cancha y la zona. Al guardar el resultado como finalizado se muestra el marcador en verde.
- El QR siempre apunta a la cartelera completa de ese torneo en el dominio desde el cual se abre el sitio. Filtrar fechas o cambiar de página no cambia el QR.
- La vista pública muestra la cartelera con QR, filtro de fecha y paginación, sin eslogan ni panel promocional.
- Cualquier visitante, sin iniciar sesión, puede usar **Compartir cartelera**, **Copiar enlace**, **Descargar QR** y **Descargar imagen**. El QR también aparece al pie de la imagen PNG. La imagen tiene 1080 píxeles de ancho, hasta ocho partidos por página y altura adaptable para incluir las posiciones completas. Para más partidos, recorrer las páginas y descargar cada una.
- La imagen descargada es una captura del momento; hay que descargarla de nuevo si cambian los datos. Quien escanea su QR accede a los datos actuales.
- Debajo de los partidos se incluyen las posiciones acumuladas de todas las zonas con el mismo diseño. Usan la misma función de cálculo que la pestaña Posiciones del torneo. El filtro de fecha limita los partidos del afiche, no el acumulado de posiciones.
- Los logos externos que no permiten exportación se omiten del PNG conservando el nombre y la inicial. La cartelera incluye una versión textual para lectores de pantalla.

## Puesta en línea

El despliegue debe tener las variables `VITE_FIREBASE_*` del proyecto. Las reglas de Firestore existentes deben permitir leer públicamente el torneo, sus partidos y el catálogo de equipos. Este cambio no modifica reglas, permisos ni datos remotos. Comprobar el enlace de un torneo real en una ventana sin sesión antes de imprimir el QR. Descargarlo desde el dominio público definitivo, no desde localhost o un despliegue temporal.

## Verificación

- `node --test src/lib/poster.test.js src/lib/tournamentEntry.test.js src/lib/standings.test.js`: ocho pruebas, incluidas puntuación y reglas de desempate existentes.
- Compilación y ESLint de los archivos modificados.
- Con `npm run dev`, `/tests/poster-preview.html` es una prueba local con datos ficticios para revisar el afiche, alternar un resultado y exportar PNG. Esta entrada de prueba no se incluye en el build de producción.
- Se verificó en navegador el cambio visual a finalizado y la descarga PNG. Pendiente: actualización entre dos dispositivos con datos reales y lectura anónima bajo las reglas del Firebase desplegado.

No se alteran los cálculos de puntos, posiciones ni desempates.
