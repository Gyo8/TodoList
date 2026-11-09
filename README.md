# Ritmo

Para continuar el proyecto con otra IA, empieza por [CONTINUIDAD-PARA-IA.md](CONTINUIDAD-PARA-IA.md): contexto, decisiones, arquitectura, historial, evidencia y próximos pasos.

Aplicación personal local, en construcción. Etapas 1–4: React, TypeScript, IndexedDB y una PWA con tareas, etiquetas, vistas guardadas, hábitos y respaldos.

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

- Crear y editar tareas con notas, prioridad, fechas planeada/límite y duración estimada.
- Completar/desmarcar, archivar/reactivar, papelera recuperable.
- Etiquetas personalizadas con color; renombrarlas conserva sus relaciones.
- Vistas iniciales, filtros combinables y vistas guardadas por nombre.
- Hasta tres prioridades diarias y sección separada de vencidas, sin duplicados.
- Guardado local transaccional y detección de ediciones desactualizadas.
- Uso sin servidor comprobado en navegador: recargar, crear y volver a recargar conserva la tarea.

Los respaldos están disponibles en Ajustes; la sincronización sigue pendiente. Borrar el almacenamiento del navegador elimina los datos locales: exporta y conserva una copia antes. La vista Todas muestra pendientes activas; el filtro Estado permite incluir completadas.

La sesión de comprobación se hizo en http://127.0.0.1:4174, separado del puerto habitual 4173 para no interferir con una instancia ya abierta. Los datos de prueba no se comparten entre esas direcciones. Para servir esa dirección: `npm run preview -- --port 4174`.

## Arquitectura

- src/domain: tipos y reglas independientes de interfaz.
- src/data: esquema versionado de IndexedDB y repositorio transaccional.
- src/ui: interfaz y estados de guardado.
- vite.config.ts: manifiesto y generación del service worker.

La base usa versión 3; conserva tareas, etiquetas y vistas e incorpora hábitos. Cada hábito almacena sus versiones de frecuencia, periodos de pausa/archivo/papelera y fechas únicas de cumplimiento en un agregado transaccional. Se evita perder registros entre pestañas y se conservan los cálculos históricos. Se reservan identificadores, timestamps, revisión y campos de archivo/borrado; no constituyen sincronización.

## Comprobaciones

Revisión de dependencias: avisos moderados corregidos; quedan cuatro bajos derivados de deepmerge en herramientas de construcción. Detalle, override y límites en [SEGURIDAD-DEPENDENCIAS.md](SEGURIDAD-DEPENDENCIAS.md).

```sh
npm test
npm run build
```

Treinta y una pruebas cubren reglas de hábitos, fechas, semanas parciales, estadísticas, migración, conflictos entre conexiones, organización de tareas, integridad de respaldos y recuperación ante fallos. Se verificaron guardado y exportación con servidor detenido; ver VALIDACION.md. El recorrido de uso real está en PRUEBA-PERSONAL.md.

## Respaldos y preferencias

En Ajustes, «Exportar respaldo completo» descarga un archivo JSON con tareas, hábitos, historial, etiquetas, vistas, prioridades diarias, archivo, papelera y preferencias. El formato tiene versión y admite hasta 10 MB. La fecha mostrada corresponde a la solicitud de descarga: comprueba que el archivo se guardó realmente.

Para recuperar datos, selecciona el archivo, revisa su resumen y escribe RESTAURAR. La operación reemplaza la información de ese navegador; no mezcla dos conjuntos. Puedes exportar lo actual antes. Un archivo incompatible se rechaza antes de escribir y un fallo durante la escritura revierte la transacción completa. Cierra otras pestañas: las conexiones anteriores al reemplazo deben recargarse antes de volver a guardar.

El respaldo contiene notas e historial sin cifrar; guárdalo en un lugar privado. No se envía a un servidor ni es una copia automática en internet. Hay un recordatorio discreto si nunca se exportó o han pasado siete días.

Las preferencias incluyen apariencia clara, oscura o según el dispositivo, inicio de semana y zona horaria para nuevos hábitos. Los hábitos existentes conservan su calendario histórico.

## Android e iPhone

Para la primera prueba Android sin alojamiento, sigue [ANDROID-USB.md](ANDROID-USB.md). El comando `npm run preview:android` sirve la compilación en el puerto fijo 4180, solo en la PC; Chrome puede reenviarlo al teléfono por USB. La conexión y la instalación en dispositivo real siguen pendientes.

La dirección de loopback anterior sirve únicamente en esta PC. Para probar en teléfono se necesitará alojamiento HTTPS o un entorno local seguro accesible desde el teléfono. No se ha publicado ni contratado ningún servicio. No se afirma compatibilidad o instalación en un dispositivo sin probarlo.

## Referencias técnicas

- https://vite.dev/guide/
- https://vite-pwa-org.netlify.app/guide/

Plan completo en REQUISITOS.md y PLAN-DE-CONSTRUCCION.md.

## Hábitos disponibles

- Días específicos o meta de 1–7 días distintos por semana.
- Fecha de inicio, icono, color, descripción y etiqueta. Zona horaria e inicio de semana conservados con el hábito.
- Registro desde Hoy, selector de fecha o calendario mensual; corrección de fechas pasadas elegibles.
- Edición con control de versiones; frecuencia nueva desde la siguiente semana. Modalidad y fecha inicial quedan fijas para proteger el historial.
- Pausa inmediata (mañana si hoy ya está marcado), reanudación, archivo y papelera recuperable. Programar una pausa futura personalizada queda pendiente.
- Gráficas de seis semanas, resumen mensual y comparación de cuatro semanas cerradas con denominadores y avisos de pocos datos.
- Metas flexibles: las semanas parciales se excluyen; el mes agrupa semanas completas cerradas cuyo último día cae en ese mes.
- Mensajes breves de reconocimiento, sin IA externa. Graduación y premios avanzados siguen en el backlog.

Prueba de hábitos aislada en http://127.0.0.1:4175 (`npm run preview -- --port 4175`). No comparte datos con 4173/4174.
