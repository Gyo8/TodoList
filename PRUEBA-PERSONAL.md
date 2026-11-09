# Primera semana con Ritmo

Estado: pruebas automáticas y revisión inicial de navegador completas; prueba personal y Android físico pendientes. No hace falta contratar servicios para probar en esta PC.

## En la PC

1. Ejecuta `npm run preview` después de compilar con `npm run build`.
2. Usa siempre la misma dirección, navegador y perfil. La dirección habitual es http://127.0.0.1:4173. Los datos de otros puertos no aparecen aquí automáticamente.
3. Espera «Lista para usar sin conexión».
4. Crea tres tareas reales y dos hábitos: uno en días fijos y otro con meta semanal. Empieza con pocos para evaluar la comodidad.
5. Exporta un respaldo desde Ajustes y comprueba que existe en Descargas. Conserva las copias anteriores durante esta prueba.

## Recorrido de siete días

| Día | Qué comprobar |
| --- | --- |
| 1 | Crear tareas, elegir prioridades y completar una. Cerrar y volver a abrir. |
| 2 | Etiquetar tareas y guardar una vista con filtro. |
| 3 | Marcar hábitos, desmarcar un error y revisar las estadísticas. |
| 4 | Abrir la misma dirección sin servidor y registrar una tarea; recargar. |
| 5 | Archivar y recuperar un elemento; comprobar que conserva sus detalles. |
| 6 | Exportar un respaldo. Probar su restauración únicamente en un perfil de prueba vacío; no reemplazar datos nuevos con una copia antigua. |
| 7 | Revisar qué resultó incómodo, exportar otra copia y priorizar ajustes. |

Registra fecha, pantalla, acción, resultado esperado y resultado real. No incluyas información privada si vas a compartir el reporte.

## Prueba en Android: pendiente de acceso desde el teléfono

Ya está preparada una ruta de prueba sin publicación: [conexión Android por USB](ANDROID-USB.md). Requiere conectar y autorizar el teléfono; todavía no está verificada en un dispositivo real.

La dirección 127.0.0.1 de la PC no sirve para abrir esta app desde el teléfono. Antes de probar instalación hay que preparar una dirección segura accesible desde Android. El alojamiento y su coste se evaluarán antes de publicar; todavía no hay un enlace público ni se ha contratado un servicio.

Cuando exista ese acceso, comprobar en el dispositivo real:

- Apertura e instalación ofrecida por el navegador; anotar modelo, navegador y versión.
- Teclado, fechas, casillas y navegación con una mano; texto legible sin ampliar.
- Esperar la preparación sin conexión, activar modo avión y cerrar/abrir la app.
- Crear y completar una tarea sin conexión; reabrir y comprobar persistencia.
- Exportar un respaldo y localizarlo en el teléfono; validar una copia en un entorno vacío.
- Volver a conectar y verificar que una actualización conserva los datos.

PC y teléfono tendrán datos separados mientras no exista sincronización. Transferir un respaldo es una operación manual de reemplazo, no una combinación automática.

## Criterio para terminar esta etapa

No perder datos en los recorridos, completar una semana real, comprobar Android e investigar los avisos de dependencias pendientes. Una revisión de tamaño móvil en PC no equivale a compatibilidad probada con Android o iPhone. La revisión completa de lector de pantalla y contraste sigue pendiente.
