# Validación de la base técnica

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
