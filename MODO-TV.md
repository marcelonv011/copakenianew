# Carteleras y pantalla del evento

Cuando un torneo ya tiene partidos de playoffs, sus diapositivas muestran las llaves de cada copa (oro, plata y bronce) con el fixture de la fecha debajo, en lugar de posiciones de grupos. Incluyen final y tercer/cuarto puesto cuando corresponde. El fixture se pagina de a tres partidos para mantener la legibilidad. Las llaves muestran el cuadro completo; los horarios inferiores siguen filtrados por el día seleccionado. Los torneos sin playoffs conservan fixture y posiciones de grupos.

Abrir https://copakenianew.vercel.app/pantalla en el navegador de la TV o de una computadora conectada por HDMI.

La presentación inicia sola y cambia cada 15 segundos. Recorre U13, U15 y U17 femeninos: partidos del día y posiciones acumuladas por grupo. Divide automáticamente las listas largas en varias diapositivas. Los datos se actualizan al cargar resultados, usando el mismo cálculo de posiciones de la administración.

La cartelera y el modo TV renuevan automáticamente la conexión a los datos cada 30 minutos, también al recuperar Internet y al volver a una pestaña que quedó suspendida más de 30 minutos. Esta actualización conserva la pantalla completa y la presentación. Los cambios en vivo siguen apareciendo sin esperar ese intervalo.

- F: pantalla completa. También se puede usar F11 en una computadora.
- Espacio: pausar o continuar.
- Flechas izquierda y derecha: cambiar manualmente de diapositiva.
- Para cambiar el intervalo: `/pantalla?segundos=20` (entre 5 y 120 segundos).
- Para una fecha específica: `/pantalla?fecha=2026-09-23&segundos=20`. Sin fecha fija, sigue el día local del dispositivo.

Cada diapositiva incluye el QR de la cartelera de esa copa. Si pierde conexión, indica que los datos pueden estar desactualizados.

## Acceso

Las carteleras y `/pantalla` son públicas. El resto del sitio requiere una cuenta con rol `admin`; se deshabilitó el registro público. Las pantallas de ingreso y recuperación de acceso siguen disponibles. Las reglas de Firestore en `firestore.rules` permiten consultar los datos deportivos necesarios para las carteleras, reservan las escrituras a administradores y restringen los perfiles de usuario. Estas reglas se publican por separado del despliegue de Vercel.

## Imágenes de los tres QR

`node scripts/generate-female-qr-posters.mjs` genera SVG vertical para imprimir y horizontal 4K para pantallas, junto con un HTML para descargar sus versiones PNG, en `tests/qr-posters/` (archivos generados excluidos de Git).

Los tres QR apuntan a las carteleras públicas femeninas de U13, U15 y U17. No apuntan a la administración.
