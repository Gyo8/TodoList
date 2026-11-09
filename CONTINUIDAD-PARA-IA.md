# Ritmo — documento de continuidad para otra IA

Fecha de corte: 9 de noviembre de 2026. Idioma de trabajo: español.

Este documento resume el propósito, decisiones, construcción, estado y siguiente trabajo de Ritmo. Es un traspaso de contexto, no una declaración de que el proyecto completo esté terminado. Debe acompañarse del código actual para continuar implementando.

## 1. Resumen para empezar

Ritmo es una aplicación de organización personal que empieza con tareas y hábitos. Funciona como web adaptable/PWA, con React y TypeScript, datos locales en IndexedDB y recursos preparados para funcionar sin conexión. No tiene backend, cuentas, sincronización ni IA externa.

El primer usuario es su creador. Su presupuesto inicial es cero: no contratar servicios ni dar por hecho que puede pagar APIs. Usa Android y PC; desea dejar abierta la compatibilidad con iPhone. Prefiere tareas ordenadas y discretas y hábitos un poco más expresivos.

La primera versión está implementada y en validación personal. Se probaron tareas, hábitos, exportación/restauración, reglas estadísticas y uso sin conexión. Hay 31 pruebas automáticas aprobadas en la última ejecución y compilación correcta. El usuario confirmó pruebas en su Android. No se ha completado una semana de uso real ni la verificación de actualización en Android conservando datos.

Último cambio funcional de infraestructura: corrección de avisos moderados en dependencias de construcción mediante un override de glob. Quedan cuatro avisos bajos derivados de deepmerge sin parche identificado en la consulta realizada. No se ha publicado la aplicación en internet.

## 2. Visión original completa

El usuario pidió planear antes de construir. La visión es más amplia que la versión inicial:

| Área | Intención original |
| --- | --- |
| Tareas | Capturar actividades generales; prioridades, etiquetas personales y vistas con filtros guardados. |
| Hábitos | Casillas de cumplimiento, frecuencias justas, gráficas diarias/semanales/mensuales y comparación de hábitos. |
| Motivación | Consejos, frases, reconocimientos, estrellas/coronas y graduación de hábitos dominados. Los graduados tendrían revisión semanal/mensual y opción de regresar a seguimiento activo. |
| Rutinas | Guía de qué hacer durante el día, sin casillas de cumplimiento; horarios de inicio/fin, semana y día, colores, prioridades y actividades movibles. |
| Compras y pagos | Listas de compras, deudas y suscripciones; avisos previos al cobro o cancelación. |
| Productos | Cuándo se compra y se termina un producto, cuánto dura, coste, tienda e historial de precios para presupuestar. |
| IA opcional | Consejos sobre hábitos, horarios y gastos; propuestas que el usuario decide aceptar. |
| Dispositivos | Smartphone y PC; datos locales sin internet y sincronización posterior cuando haya conexión. |
| Privacidad | Evitar datos sensibles innecesarios y secretos en el cliente; explicar el uso de IA y solicitar consentimiento cuando corresponda. |

Se habló de permitir una IA preferida o acceso con Google, pero no se eligió ni implementó un proveedor. No asumir que iniciar sesión en Google o tener una suscripción de chat concede acceso gratuito a una API. La arquitectura, coste y tratamiento de datos de esa función se deben investigar cuando se retome.

## 3. Decisiones y motivos

- **Alcance reducido primero:** tareas y hábitos para llegar a uso personal sin construir todos los módulos a la vez.
- **Web/PWA antes que aplicaciones nativas:** una interfaz para PC y Android, con instalación donde la plataforma lo permita. iPhone sigue siendo objetivo futuro por probar.
- **Datos locales primero:** IndexedDB permite persistencia sin servidor y evita exigir cuentas o servicios de pago al inicio.
- **Respaldo antes de ampliar módulos:** almacenamiento local no equivale a copia segura; se necesita exportar y recuperar información.
- **Separación de dominio, datos e interfaz:** preparar cambios futuros de almacenamiento sin meter reglas estadísticas dentro de componentes.
- **Estadísticas desde registros:** los porcentajes se calculan; no se guardan como una segunda fuente de verdad.
- **Historia estable:** cambiar frecuencia o preferencias no debe modificar retrospectivamente qué se esperaba de un hábito.
- **Mensajes de motivación locales:** reconocimiento breve sin pagar IA y sin atribuir citas inventadas a filósofos.
- **Sin publicación inicial:** se preparó Android por USB para probar sin alojamiento ni dominio.

Estas decisiones describen la primera etapa, no cancelan la visión original. No cambiar el alcance ni escoger servicios externos como si ya estuvieran aprobados.

## 4. Diseño de experiencia

Nombre provisional: Ritmo. Frase: «Un día a la vez».

Cuatro secciones: **Hoy, Tareas, Hábitos y Ajustes**. En escritorio hay navegación lateral; en móvil, navegación superior compacta. Colores base verdes, superficies suaves, tarjetas de hábitos con iconos y acentos; las tareas se presentan como listas con controles claros. Apariencia clara, oscura o según el dispositivo.

Hoy reduce la carga de decisión con hasta tres prioridades, tareas del día/vencidas y hábitos pertinentes. La prioridad diaria es independiente de la prioridad general de la tarea. Tareas permite organización más detallada. Hábitos enfatiza constancia y descansos justos. Ajustes reúne respaldo, preferencias, etiquetas e información de almacenamiento.

Existe un boceto HTML original fuera del repositorio, en la carpeta de visualizaciones del entorno original, llamado `ritmo-prototipo.html`. Fue referencia visual aceptada; no es el código de producción ni es necesario para ejecutar la app. Las capturas del proyecto muestran versiones implementadas.

## 5. Cómo se construyó

| Etapa | Trabajo y resultado |
| --- | --- |
| Planeación, desde 4 de noviembre | Se acordaron primer usuario, coste cero, Android/PC, alcance tareas/hábitos y estilo visual. Se redactaron requisitos y lista de construcción. |
| Base, 8 de noviembre | React/TypeScript/Vite, esquema local v1, repositorio de tareas y PWA. Primeras cuatro pruebas. |
| Tareas, 8 de noviembre | Edición, notas, fechas, etiquetas, vistas, tres prioridades diarias, archivo y papelera. Migración a v2; 11 pruebas. |
| Hábitos, 8 de noviembre | Días fijos y metas semanales, historial de reglas, pausas, calendario y comparación. Migración a v3; 22 pruebas. |
| Respaldo, 9 de noviembre | JSON versionado, validación, resumen previo, restauración transaccional, protección frente a sesiones antiguas y preferencias; 29 pruebas. |
| Validación personal | Acceso por teclado, foco visible, revisión móvil y pruebas de domingo/conexiones simultáneas; 31 pruebas. |
| Android real | Reenvío USB desde Chrome. El usuario confirmó persistencia de tareas/hábitos, modo avión y descarga de respaldo. |
| Recuperación Android→PC | El archivo trasladado se validó y restauró en una instancia aislada; dos tareas, un hábito y su registro persistieron tras recargar. |
| Dependencias | Override limitado a Workbox para glob 14.0.4/minimatch 11.0.5; se eliminaron avisos moderados y se verificó nuevamente la construcción. |

Se corrigieron problemas concretos durante las pruebas: captura de fechas introducidas en formularios y un aviso erróneo de «otra pestaña» al restaurar en la misma sesión. Las comprobaciones de navegador iniciales tuvieron problemas de acceso al servidor; después se realizaron correctamente. No interpretar esos bloqueos históricos como estado actual.

## 6. Arquitectura y mapa del código

Flujo actual: **interfaz React → reglas de dominio y repositorios → IndexedDB**. El service worker conserva recursos de la aplicación; los datos personales se guardan en IndexedDB, no en la caché de archivos de la PWA.

| Archivo/directorio | Responsabilidad |
| --- | --- |
| `src/main.tsx` | Entrada de React. |
| `src/ui/App.tsx` | Navegación, conexión, actualización PWA, formularios sin guardar, preferencias y avisos de restauración. |
| `src/ui/TaskWorkspace.tsx` | Tareas, filtros/vistas, etiquetas, prioridades, archivo y papelera. |
| `src/ui/HabitWorkspace.tsx` | Formularios, seguimiento, historial y estadísticas de hábitos. |
| `src/ui/BackupSettings.tsx` | Exportación, selección/validación del archivo, confirmación, restauración y preferencias. |
| `src/ui/styles.css` | Diseño adaptable, temas y foco/teclado/reducción de movimiento. |
| `src/domain/task.ts` | Tipos, creación y validación de tareas. |
| `src/domain/views.ts` | Etiquetas, vistas y lógica de filtros/orden. |
| `src/domain/habit.ts` | Calendarios, reglas, registros, pausas, edición y cálculos. |
| `src/data/database.ts` | Esquema IndexedDB, migraciones y protección de generación tras restauración. |
| `src/data/*Repository.ts` | Operaciones persistentes y control de revisiones/transacciones. |
| `src/data/preferences.ts` | Preferencias locales y valores predeterminados. |
| `src/data/backup.ts` | Formato, límites, validación, exportación y restauración atómica. |
| `src/**/*.test.ts` | Pruebas con Vitest y fake-indexeddb. |
| `vite.config.ts` | React, manifiesto, precaché y actualizaciones PWA mediante aviso. |
| `public/` | Iconos de la aplicación. |
| `qa/respaldo-incompatible.json` | Archivo deliberadamente incompatible para probar rechazo. |

Versiones declaradas al corte: React 19.3.1, TypeScript 7.0.2, Vite 8.3.6, idb 8.0.4, vite-plugin-pwa 2.0.0, Vitest 5.1.0 y fake-indexeddb 6.2.7. Consultar `package-lock.json` para las versiones exactas instaladas. No reemplazarlo por dependencias elegidas de memoria.

El paquete aún declara versión 0.1.0 y la interfaz muestra 0.4: es una inconsistencia de identificación por ordenar antes de establecer un proceso de versiones. No confundirlas con la versión 3 de la base de datos ni con la versión 1 del formato de respaldo.

## 7. Datos e invariantes que deben preservarse

Base: `ritmo-local`, esquema **3**. Stores: `tasks`, `settings`, `tags`, `views`, `focus`, `habits`.

- Las tareas guardan UUID, título, notas, prioridad, fechas planeada/límite, duración, IDs de etiquetas, fechas técnicas, revisión y estados de completado/archivo/papelera.
- Las vistas guardan filtros y orden, no copias de tareas. Una vista puede conservar IDs de etiquetas eliminadas intencionalmente: eliminarlos silenciosamente podría ampliar su filtro.
- `focus` vincula fecha y hasta tres tareas. Ese límite se aplica transaccionalmente.
- Cada hábito es un agregado: configuración, versiones de frecuencia (`rules`), periodos de pausa/archivo/papelera (`breaks`) y fechas únicas cumplidas (`records`). No existen stores independientes para cada entidad conceptual del plan original.
- Fechas de calendario: `YYYY-MM-DD`; eventos técnicos: marcas temporales UTC. Los hábitos conservan zona horaria e inicio de semana propios. Las fechas de tareas siguen el calendario del dispositivo.
- Los repositorios comprueban revisiones para rechazar ediciones obsoletas. Tras restaurar, cambia `settings._generation`; conexiones anteriores no deben volver a sobrescribir los datos recuperados. Este control no es sincronización entre dispositivos.
- Las migraciones v1→v2→v3 conservan datos. No borrar ni recrear la base como sustituto de una migración.

Reglas estadísticas importantes:

1. Días fijos: solo las fechas programadas y elegibles cuentan como oportunidades. Días de descanso son neutros; futuros no son fallos.
2. Meta semanal: 1–7 fechas distintas; 4/4 es 100 %, 5/4 conserva 100 % y muestra un extra. No marcar individualmente cada día libre como incumplimiento.
3. Semanas flexibles parciales por inicio/pausa/archivo se identifican y excluyen de la comparación; no inventar metas proporcionales.
4. Periodos abiertos muestran progreso, no una tasa final de fracaso. Sin oportunidades equivale a «no aplica».
5. El resumen mensual flexible agrega semanas completas cerradas cuyo último día cae en ese mes; pondera por objetivos, no promedia porcentajes arbitrariamente.
6. Cambiar frecuencia surte efecto desde la siguiente semana; modalidad, inicio, zona horaria e inicio de semana del hábito existente permanecen fijos.
7. Pausar con registro hecho hoy comienza mañana. Reanudar no convierte las fechas pausadas en fallos. Programar pausas futuras personalizadas no está implementado.
8. Corregir registros pasados es posible en fechas elegibles; no registrar futuro ni antes del inicio.

## 8. Respaldo y seguridad

Formato JSON: `app: "ritmo"`, `formatVersion: 1`, `schemaVersion: 3`, `exportedAt` y `data` con las seis colecciones. Límite de archivo: 10 MiB. Se validan estructura, fechas, límites, identificadores, relaciones y estados históricos; se descartan campos desconocidos. `_generation` no forma parte del respaldo exportado.

Restaurar **reemplaza**, no combina. La interfaz muestra resumen, permite exportar lo actual y requiere escribir RESTAURAR. La escritura es una transacción: ante fallo debe conservarse la información previa. El respaldo incluye historial, archivo y papelera. No está cifrado. La fecha de última exportación registra una descarga solicitada, no demuestra por sí sola que el usuario guardó el archivo.

No hay proveedor de identidad, credenciales API, analítica ni IA externa implementados. Una revisión de fuentes no encontró destinos externos para enviar contenido personal; eso no equivale a auditoría integral ni a cifrado del almacenamiento local.

Estado de dependencias al corte: cuatro avisos bajos de la cadena deepmerge; cero moderados/altos/críticos y cero avisos conocidos en `npm audit --omit=dev`. Override actual: `workbox-build > glob = 14.0.4`, que resuelve minimatch 11.0.5. Es un cambio fuera del rango original de Workbox, validado para esta construcción; revisar cuando exista soporte oficial. Leer [SEGURIDAD-DEPENDENCIAS.md](SEGURIDAD-DEPENDENCIAS.md). No aplicar `npm audit fix --force` sin evaluar los cambios principales propuestos.

## 9. Qué está comprobado y qué no

**Automáticamente y en PC:** 31 pruebas, compilación y 12 entradas de precaché con archivos existentes. Casos de hábitos, migraciones, conflictos, etiquetas, vistas, límites, respaldo inválido y reversión ante fallo. Navegador: persistencia, exportación/restauración y operación con servidor detenido. Cuatro pantallas a 360 px sin desbordamiento en los estados revisados; salto al contenido con teclado.

**Reportado por el usuario en Android:** apertura mediante USB; tareas conservadas después de recargar sin cable/en modo avión; apertura desde icono conservando tareas; hábito y estadísticas conservados al cerrar/abrir; respaldo localizado en Descargas. El agente no observó directamente la pantalla del teléfono. No se registraron modelo/versiones ni si el icono era PWA instalada o acceso directo.

**Recuperación observada en PC:** el archivo trasladado contenía dos tareas, un hábito y un registro. Se validó y restauró en el puerto 4181 y permaneció tras recarga. Había otro archivo más reciente pero vacío: no elegir respaldos solo por fecha. No incluir nombres ni contenido personal de esos registros en paquetes compartidos.

**Pendiente:** actualización real en Android conservando datos, una semana de uso, lector de pantalla, contraste medido, pruebas completas desde 320 px, integración explícita entre pantallas y iPhone. La restauración dentro de Android no se probó; sí se probó en PC el archivo trasladado. No declarar la etapa 5 completa.

## 10. Ejecución y entorno

Ubicación original: `C:\Users\corre\Documents\ChatGPT\TodoList`. Windows/PowerShell. Se usaron Node 24.16.0 y npm 11.13.0. Esas rutas no son requisito en otra computadora.

```sh
npm ci
npm test
npm run build
npm run preview
```

`npm ci` es para preparar una copia nueva con el lockfile, no un requisito de cada turno. `npm run dev` sirve para desarrollo pero no activa el service worker. Para probar sin conexión usar producción compilada y esperar «Lista para usar sin conexión».

- Preview habitual: `http://127.0.0.1:4173/`.
- Android: `npm run preview:android`, PC en 127.0.0.1:4180; Chrome reenvía puerto 4180 por USB al teléfono, que abre `http://localhost:4180/`.
- Puertos 4174–4177 y 4181 se usaron para pruebas aisladas. No asumir que sus servidores siguen activos.
- Host, puerto, navegador y perfil determinan almacenes separados. `localhost` y `127.0.0.1` no comparten datos. Cambiar dirección puede parecer pérdida de datos sin que se hayan borrado.
- La autorización de depuración del teléfono la concede su propietario. No modificar permisos ni borrar datos para resolver una conexión.
- Si el entorno restringido no permite acceder a red o al servidor, solicitar el permiso correspondiente. No desactivar protecciones ni abrir el servidor a toda la red por defecto.

La copia Git contiene cambios modificados y archivos sin seguimiento de varias etapas. No asumir que todo está en el último commit, ni descartar esos cambios. No se ha creado un commit o publicación como parte de este traspaso. Revisar el estado antes de editar y conservar trabajo existente.

## 11. Pendientes y orden recomendado

### Cerrar la versión personal

1. Leer el código y las últimas validaciones; confirmar el estado real sin repetir pruebas ya completadas sin motivo.
2. Normalizar identificación de versión y preparar una actualización controlada. Exportar respaldo antes y comprobar Android sin pérdida de datos.
3. Completar accesibilidad y pruebas pendientes de integración entre pantallas.
4. Acompañar la semana real de uso y corregir problemas encontrados. No fingir que transcurrió una semana ni automatizarla sin petición.
5. Vigilar el aviso pendiente cuando se vuelvan a revisar dependencias y documentar límites.
6. Evaluar acceso habitual sin USB. Si se propone alojamiento, verificar coste/límites vigentes y explicar dónde se publica antes de hacerlo.

### Evolución posterior, todavía sin implementación

Sincronización Android/PC es la siguiente recomendación de alto valor, pero no hay proveedor aprobado. Requiere diseñar autenticación, permisos por usuario, cola local, conflictos, borrados sincronizados, reintentos idempotentes y migración/recuperación. Una base en la nube por sí sola no resuelve esto.

Después: graduación de hábitos; rutinas; compras/pagos; seguimiento de productos; notificaciones; IA opcional con consentimiento, minimización de datos y coste controlado. Orden ajustable con el usuario. Antes de abrirla a terceros, revisar privacidad, seguridad y obligaciones aplicables. El consentimiento no es garantía de evitar demandas.

## 12. Documentos y diferencias con el plan inicial

| Documento | Cómo usarlo |
| --- | --- |
| Este archivo | Punto de entrada y fotografía actual para el traspaso. |
| [REQUISITOS.md](REQUISITOS.md) | Intención original y reglas detalladas; contiene propuestas que no llegaron a implementarse. |
| [PLAN-DE-CONSTRUCCION.md](PLAN-DE-CONSTRUCCION.md) | Etapas y backlog; algunas notas generales quedaron anteriores a las pruebas Android y la última auditoría. |
| [README.md](README.md) | Ejecución y funciones. |
| [VALIDACION.md](VALIDACION.md) | Evidencia por etapa, con historial. Priorizar los resultados recientes; una nota antigua de «pendiente» puede haber sido resuelta después. |
| [ANDROID-USB.md](ANDROID-USB.md) | Conexión y comprobaciones del teléfono. |
| [PRUEBA-PERSONAL.md](PRUEBA-PERSONAL.md) | Recorrido de siete días. |
| [SEGURIDAD-DEPENDENCIAS.md](SEGURIDAD-DEPENDENCIAS.md) | Auditoría, override, riesgo pendiente y verificaciones. |

Diferencias conocidas: no hay vaciado definitivo de papelera ni botón general de restablecimiento; restaurar un respaldo sí reemplaza datos. No hay programación personalizada de pausas futuras. El esquema real usa agregados de hábito, no todas las tablas conceptuales listadas en requisitos. Los ajustes de semana/zona afectan hábitos nuevos; tareas siguen el dispositivo. El archivo de requisitos no debe tomarse como inventario de funciones terminadas.

Si documentos y código discrepan, inspeccionar comportamiento, registrar la discrepancia y aclarar el alcance; no cambiar silenciosamente una regla de producto por leer una nota vieja.

## 13. Cómo entregar el proyecto a otra IA

Para conversar sobre la idea basta este documento. Para modificar la app, entregar también `src/`, `public/`, `qa/`, `package.json`, `package-lock.json`, `index.html`, archivos de configuración Vite/TypeScript, `.gitignore` y los documentos Markdown. Preservar la estructura de carpetas. Comprobar que se incluyan archivos todavía no añadidos a Git.

No hace falta enviar `node_modules/`, `dist/`, cachés ni logs. No adjuntar `.env`, credenciales, el perfil del navegador o respaldos personales. Revisar las capturas antes de compartirlas: algunas muestran datos del usuario. Un respaldo no sustituye al código; el código tampoco incluye automáticamente los datos de IndexedDB.

Texto sugerido para iniciar el siguiente chat:

> Continúa el proyecto Ritmo desde el código adjunto. Lee primero CONTINUIDAD-PARA-IA.md y las validaciones recientes. Conserva las decisiones de presupuesto cero, datos locales y estadísticas justas. Antes de editar, revisa el estado de los archivos; hay trabajo que puede no estar incluido en commits. Distingue lo implementado, lo probado directamente y lo reportado por mí. No reinicies el proyecto ni sustituyas el almacenamiento. Resume dónde estamos y continúa con el pendiente que te indique; si digo «sigue», prioriza cerrar la validación personal antes de añadir módulos. No publiques, contrates servicios ni incorpores IA externa sin acordarlo conmigo.

Actualizar este documento después de cada hito: fecha, cambios, pruebas, pendientes y decisiones nuevas. No incluir secretos ni datos personales de tareas/hábitos.
