# Ritmo

Aplicación personal local, en construcción. Etapa 1: React, TypeScript, IndexedDB y una PWA con recursos guardados para trabajar sin conexión.

## Ejecutar

Requiere Node.js compatible con la versión de Vite fijada en package-lock.json.

```sh
npm ci
npm run dev
```

Para comprobar la versión con funcionamiento sin conexión:

```sh
npm run build
npm run preview
```

Abrir http://127.0.0.1:4173. Esperar «Lista para usar sin conexión» antes de desconectar. El modo de desarrollo no activa el service worker. Usar siempre el mismo navegador, perfil y dirección: localhost, 127.0.0.1 y puertos diferentes tienen almacenamientos separados.

## Disponible

- Crear tareas con prioridad y fecha planeada opcional.
- Completar/desmarcar, vistas Hoy, pendientes, todas y completadas.
- Guardado local confirmado al completar la transacción, sin servidor ni cuenta.
- Aviso de nueva versión antes de recargar.
- Navegación inicial y páginas informativas de Hábitos y Ajustes.

Todavía no incluye editar/eliminar, etiquetas, vistas guardadas, hábitos, respaldos ni sincronización. Usar para pruebas: borrar el almacenamiento del navegador elimina los datos. No confundir los filtros iniciales de esta prueba con el alcance completo de REQUISITOS.md; la vista Todas de la base técnica incluye completadas.

## Arquitectura

- src/domain: tipos y reglas independientes de interfaz.
- src/data: esquema versionado de IndexedDB y repositorio transaccional.
- src/ui: interfaz y estados de guardado.
- vite.config.ts: manifiesto y generación del service worker.

Los porcentajes de hábitos no se implementan en esta etapa. La base comienza en versión 1; migraciones futuras deben preservar tareas existentes. Se reservan identificadores, timestamps, revisión y campos de archivo/borrado; no constituyen sincronización.

## Comprobaciones

```sh
npm test
npm run build
```

Las pruebas con fake-indexeddb comprueban reapertura, cumplimiento persistente, duplicados y errores de escritura. No reemplazan una prueba real en navegador con el service worker activo.

## Android e iPhone

La dirección de loopback anterior sirve únicamente en esta PC. Para probar en teléfono se necesitará alojamiento HTTPS o un entorno local seguro accesible desde el teléfono. No se ha publicado ni contratado ningún servicio. No se afirma compatibilidad o instalación en un dispositivo sin probarlo.

## Referencias técnicas

- https://vite.dev/guide/
- https://vite-pwa-org.netlify.app/guide/

Plan completo en REQUISITOS.md y PLAN-DE-CONSTRUCCION.md.
