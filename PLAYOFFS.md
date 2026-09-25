# Cruces de las copas femeninas

En cada torneo, abrir **Playoffs → Generar cruces**. El botón requiere que estén cargados y finalizados todos los encuentros de grupos, con resultados válidos.

- U13: finales oro (1.º–2.º), plata (3.º–4.º) y bronce (5.º–6.º). El 7.º termina su participación.
- U15 y U17: semifinales oro (1.º A–2.º B y 1.º B–2.º A), semifinales plata (3.º A–4.º B y 3.º B–4.º A), finales para los ganadores y final bronce (5.º A–5.º B).

La clasificación usa la función de posiciones existente, sin modificar puntos ni desempates. No se generan partidos de grupos. La creación se guarda en una transacción y no permite repetir la generación ni sobrescribir otros cruces existentes. Los participantes quedan fijados al generar; una corrección posterior de grupos no vuelve a sortear el cuadro.

Los horarios y sedes se editan desde cada partido. Al guardar el resultado de una semifinal, su ganador se asigna a la final en la misma transacción. Una corrección que cambiaría un finalista se rechaza si la final ya empezó o tiene puntos; primero se debe volver esa final a programada y vaciar su marcador. Los partidos generados no se borran ni permiten cambiar manualmente equipos o fase.

El cuadro completo se puede descargar como PNG. Cada botón **Instagram · Copa oro/plata/bronce** descarga una imagen independiente de 1080 × 1350. Incluye los equipos reales, sus escudos disponibles, cruces, fechas y resultados. Si un escudo externo no permite su descarga, se conserva el nombre del equipo.

Los cuadros también aparecen en la cartelera pública del torneo y se actualizan con los resultados. Los partidos aparecen en el fixture y el modo TV cuando tienen fecha asignada.

Validación: `node --test src/lib/playoffs.test.js src/lib/standings.test.js`. Vista visual con datos ficticios: `/tests/playoff-preview.html` usando Vite en desarrollo. No se crean datos de prueba en producción.
