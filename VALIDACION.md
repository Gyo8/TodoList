# Validación de la base técnica

## Dependencias: corrección de avisos moderados

El 9 de noviembre de 2026 se actualizó glob a 14.0.4 mediante override limitado a Workbox; minimatch pasó a 11.0.5. La auditoría pasó de seis avisos (dos bajos/cuatro moderados) a cuatro bajos de la cadena deepmerge; sin moderados, altos ni críticos. Las dependencias de ejecución reportan cero avisos conocidos. Detalle y limitaciones en SEGURIDAD-DEPENDENCIAS.md.

Las 31 pruebas pasaron; TypeScript y producción/PWA compilaron correctamente. Se verificó que las 12 entradas de precaché existen e incluyen los recursos esenciales de la app. El aviso bajo sin parche sigue pendiente; no se declara una auditoría integral terminada.

## Recuperación del respaldo trasladado desde Android

- Se encontraron dos archivos nuevos en Descargas: el de 13:38:40 UTC contenía dos tareas, un hábito y un registro; el de 16:51:29 UTC estaba vacío. Se utilizó el primero, coherente con la prueba reportada. El origen físico del archivo no tiene una marca verificable de dispositivo.
- La interfaz validó el archivo y mostró el resumen antes de restaurar en la instancia aislada 127.0.0.1:4181. Tras restaurar y recargar, Tareas mostró las dos tareas y Hoy mostró el hábito con su registro marcado y avance semanal.
- No se reemplazaron datos del teléfono ni de las instancias habituales de PC. No hay sincronización. Captura local: ritmo-android-restaurado.jpg. Servidor temporal 4181 detenido tras la verificación.

## Prueba guiada en Android: confirmaciones del usuario

El usuario confirmó apertura por USB, funcionamiento y conservación de dos tareas tras recargar sin cable/en modo avión, conservación al abrir desde un icono y localización del JSON exportado en Descargas. Son resultados reportados por el usuario, no observación directa del agente sobre el teléfono.

El usuario también confirmó crear un hábito para hoy, marcarlo y conservar el registro y sus estadísticas después de cerrar y abrir desde el icono.

No se precisó si Chrome ofreció instalar la PWA o añadir un acceso directo. Siguen pendientes modelo y versiones del dispositivo, restauración del respaldo descargado en Android, actualización conservando datos y semana real de uso. Las notas anteriores se conservan como historial.

## Preparación Android por USB, 9 de noviembre de 2026

- Añadido `npm run preview:android`: puerto fijo 4180, acceso limitado a 127.0.0.1 y fallo si el puerto está ocupado.
- Servidor iniciado y respuesta HTTP 200 comprobada para la página y service worker; manifiesto recibido. Se utiliza la compilación verificada en la etapa anterior; no cambió el código de la app.
- Chrome encontrado en la PC. Guía de reenvío por USB basada en documentación oficial en ANDROID-USB.md. No se instaló Android Studio, no se publicó el sitio ni se modificaron permisos del teléfono.
- La prueba del dispositivo requiere cable, teléfono disponible y autorización de depuración por su propietario. No se ha comprobado conexión USB, instalación ni modo avión en Android. Servidor detenido después de la comprobación local.

## Actualización: verificación personal, 9 de noviembre de 2026

- 31 pruebas aprobadas y compilación de producción/PWA correcta. Se añadieron semanas con inicio en domingo, protección del calendario histórico y escrituras desde dos conexiones independientes sin perder registros; la edición obsoleta es rechazada.
- Acceso «Saltar al contenido» comprobado con Tab y Enter: el foco termina en el contenido principal. Foco visible añadido a notas y desplegables; estilos preparados para reducir movimiento.
- Navegador integrado en 127.0.0.1:4177, sin datos personales: Hoy, Tareas, Hábitos y Ajustes revisadas a 360×800. El ancho del contenido coincide con el disponible (345 px con barra de desplazamiento o 360 px sin ella); no hubo desbordamiento horizontal. Captura: ritmo-movil-verificacion.jpg.
- Revisión del código de la aplicación: no se encontraron llamadas fetch, claves API ni destinos externos de envío en src/public/index.html. No sustituye una auditoría completa de seguridad ni una inspección de tráfico.
- Servidor temporal detenido al finalizar. Guía de prueba personal y recorrido Android en PRUEBA-PERSONAL.md.

Pendientes: Android/iPhone físicos, semana real de uso, contraste medido y lector de pantalla, revisión de dependencias. No se afirma que toda la etapa 5 esté terminada.

## Actualización: respaldos, 9 de noviembre de 2026

- 29 pruebas aprobadas. Las siete nuevas cubren ida y vuelta del respaldo con todas las entidades, relaciones e historial; versiones incompatibles; duplicados, fechas y referencias inválidas; límites de tamaño; ajustes desconocidos y vistas que conservan etiquetas eliminadas.
- Fallo de escritura simulado después de comenzar el reemplazo: la transacción se revierte y conserva los datos previos. Conexiones abiertas antes de restaurar no pueden sobrescribir la información recuperada.
- Compilación TypeScript, producción y precaché PWA aprobados.
- Navegador: exportación real en 127.0.0.1:4176 e importación en localhost:4176, inicialmente vacío. Resumen previo, confirmación y tarea recuperada comprobados. Son almacenes aislados de la instancia habitual 4173.
- Archivo de versión incompatible rechazado en la interfaz; la tarea permaneció después de recargar. Se corrigió y verificó un aviso de otra pestaña que aparecía por error en la misma sesión al restaurar.
- Actualización de la PWA comprobada sin perder la tarea. Servidor detenido: recarga de la app y descarga de un respaldo verificadas. La red del dispositivo siguió conectada; no es una prueba en modo avión.
- Captura: ritmo-respaldos-verificacion.jpg. El servidor temporal 4176 quedó detenido.

Límites: respaldos sin cifrar, sin sincronización ni copia automática remota. Falta probar Android/iPhone físicos, completar la revisión de accesibilidad y usar la app una semana. Las preferencias están implementadas; falta una comprobación visual exhaustiva de todas sus combinaciones. Los avisos de dependencias del informe inicial siguen pendientes. Las secciones siguientes conservan el historial de etapas anteriores.

## Actualización: hábitos, 8 de noviembre de 2026

- 22 pruebas aprobadas en 3 archivos. Cubren días fijos, metas flexibles, unicidad de fechas, extras con límite de 100 %, correcciones, pausas, semanas parciales, archivo, versiones de frecuencia, resumen mensual, pocas oportunidades, zona horaria, cruce de año y migración v2→v3.
- Compilación TypeScript y producción aprobadas; precaché PWA generado.
- Navegador en dirección aislada http://127.0.0.1:4175: creación de hábitos, registro del día, recarga, hábito de sábado y registro histórico elegible comprobados.
- Se detectó y corrigió la captura de fechas escritas: el formulario y selectores ahora procesan también el evento de entrada. Se verificó inicio el 1 de noviembre y registro del sábado 7.
- Pausar un hábito ya registrado hoy conserva su cumplimiento y comienza mañana; comprobado en la interfaz.
- Calendario y estadísticas distinguen futuros, descansos y semanas sin oportunidades. Se inspeccionó la pantalla de estadísticas y se comprobó ausencia de desbordamiento horizontal en viewport móvil; ancho visible y contenido coinciden (314 px en la medición del navegador integrado).
- Servidor detenido: recarga, corrección y nuevo registro del sábado 7 guardados; una nueva recarga conservó 1 de 1 sesiones. La red del dispositivo permaneció conectada: se comprobó independencia del servidor, no modo avión.
- Captura: ritmo-habitos-verificacion.jpg. Solo datos de prueba en el puerto 4175, separados de las otras instancias. Servidor detenido al terminar.

Límites: no se ha probado Android físico/iPhone; falta respaldo/importación. La modalidad, inicio, zona horaria e inicio de semana de un hábito ya creado se conservan; editar permite cambiar frecuencia a partir de la próxima semana. Las pausas se aplican ahora o mañana si hoy ya hay registro; programar una fecha de pausa personalizada queda pendiente. Graduación e IA continúan fuera de esta etapa. Los avisos de dependencias del informe inicial no se han vuelto a auditar ni corregido en este cambio.

## Actualización: tareas y prueba real, 8 de noviembre de 2026

- `npm test`: 11 pruebas aprobadas en 2 archivos. Se añadieron migración v1→v2 preservando tareas, conflictos de edición, archivo/papelera/restauración, etiquetas y vistas persistentes, filtros, límite transaccional de tres prioridades y validación de fechas/duración.
- `npm run build`: TypeScript, compilación y precaché de la PWA aprobados.
- Prueba en navegador integrado, dirección aislada http://127.0.0.1:4174: creación, edición de título/notas/prioridad, creación y asignación de etiqueta, vista guardada, recarga, papelera/restauración y cumplimiento verificados.
- Servidor de prueba detenido: la app abrió tras recargar; permitió crear «Prueba sin servidor: ir por agua», y esa tarea permaneció tras una nueva recarga. La tarea completada y su etiqueta también permanecieron.
- El indicador «Con conexión» refleja la red del dispositivo, no la disponibilidad del servidor: no se desactivó la red del equipo. La prueba demuestra independencia del servidor para recursos y guardado locales.
- Revisión visual en escritorio y viewport móvil de 360×800. Sin desbordamiento horizontal en la pantalla Hoy: ancho de documento y contenido de 345 px, descontada la barra de desplazamiento.
- Captura: ritmo-verificacion.jpg. Datos de prueba únicamente. No se modificó ni detuvo la instancia ya existente en el puerto 4173.
- La vista previa de prueba quedó detenida; la pestaña ya preparada puede seguir funcionando desde caché.

Pendientes: instalación y prueba en Android físico/iPhone, pantalla de respaldos, hábitos y revisión de los avisos de dependencias. El informe anterior se conserva como historial; el bloqueo del navegador descrito debajo ya se resolvió.

## Historial de la base inicial

8 de noviembre de 2026.

## Comprobado

- Node 24.16.0 y npm 11.13.0 disponibles.
- Dependencias instaladas y fijadas en package-lock.json.
- `npm test`: 4 pruebas aprobadas. Reapertura conserva tarea y cumplimiento; desmarcado; rechazo de duplicados; error con base cerrada; validación de títulos.
- `npm run build`: TypeScript y compilación aprobados.
- PWA: manifiesto, iconos 192/512, service worker y precaché generados.
- Vista previa local iniciada fuera del entorno restringido: HTTP 200 comprobado en http://127.0.0.1:4173. Servidor detenido al finalizar las comprobaciones.

## Límites de verificación

Las pruebas usan fake-indexeddb: verifican persistencia entre conexiones de la misma base simulada, no persistencia física al cerrar un navegador real. El navegador automatizado agotó el tiempo de espera en dos intentos; no se pudo inspeccionar visualmente ni comprobar la recarga sin servidor. No se ha probado instalación en Android o iPhone.

El servidor iniciado dentro del entorno restringido no fue accesible desde la PC. Al ejecutarlo fuera de ese entorno respondió correctamente. No confundir respuesta HTTP correcta con inspección visual o instalación comprobadas.

## Seguridad de dependencias

`npm audit` informó 6 avisos: 2 bajos y 4 moderados, sin altos ni críticos. La cadena corresponde a herramientas de construcción de la PWA: vite-plugin-pwa/workbox-build y dependencias deepmerge, glob y minimatch. El informe no señala las dependencias de ejecución react, react-dom o idb. Esto no constituye una auditoría de seguridad completa.

No se aplicó `npm audit fix --force`: la corrección sugerida implica cambiar de versión principal de vite-plugin-pwa. Antes de publicar o incorporar fuentes externas al proceso de construcción, revisar versiones compatibles y volver a ejecutar auditoría, compilación y pruebas. Los archivos personales de tareas no se introducen en el proceso de construcción.

## Prueba manual pendiente

1. Ejecutar `npm run build` y `npm run preview`.
2. Abrir http://127.0.0.1:4173 en el mismo perfil de navegador que se utilizará para las pruebas.
3. Esperar «Lista para usar sin conexión».
4. Crear una tarea, completarla y recargar. Comprobar el registro en Completadas.
5. Detener el servidor y recargar la misma dirección. La app debe abrir desde la caché.
6. Crear otra tarea sin servidor, recargar y comprobar que permanece.
7. Reanudar el servidor. Revisar anchos móvil y escritorio, teclado y legibilidad.

No guardar información irremplazable antes de incorporar y verificar respaldos. La app muestra esta limitación en Ajustes.
