# Ritmo — requisitos de la primera versión

Estado: plan previo a implementación. Nombre provisional.
Fecha: 4 de noviembre de 2026.

## 1. Propósito y decisiones acordadas

Aplicación de organización personal para capturar tareas, decidir qué atender hoy y seguir hábitos con estadísticas justas. El primer usuario será su creador. El boceto navegable fue aceptado como dirección visual, no como aplicación terminada.

- Presupuesto inicial objetivo: cero gasto en servicios.
- Android y PC mediante una web adaptable e instalable como PWA.
- Compatibilidad futura con iPhone; no prometer soporte hasta probarlo.
- Primera versión: Hoy, Tareas, Hábitos y Ajustes.
- Tareas ordenadas y discretas; hábitos más expresivos, con colores suaves e iconos.
- Sin cuenta obligatoria, servidor, IA externa ni sincronización inicial.
- Datos locales en un dispositivo principal. Instalar en otro dispositivo no comparte información.
- Una vez cargada y preparada para uso sin conexión, las funciones principales deben funcionar sin internet.

Las siguientes reglas concretan propuestas del plan. Se podrán ajustar durante la implementación si la experiencia de uso lo requiere; no representan funciones ya construidas.

## 2. Alcance

### Incluido

- Crear, editar, completar, archivar y eliminar tareas.
- Prioridades, etiquetas, fechas opcionales, duración estimada y vistas guardadas.
- Hábitos de días fijos o meta de días por semana, registros corregibles, pausas y archivo.
- Resumen diario, progreso semanal y calendario mensual por hábito.
- Exportación e importación de respaldo completo, papelera y preferencias.
- Instalación y funcionamiento sin conexión donde la plataforma lo permita.

### Posterior

Sincronización, cuentas, IA, notificaciones, recordatorios programados, tareas recurrentes, subtareas, rutinas, compras, pagos, seguimiento de productos, graduación y premios avanzados. Tampoco habrá colaboración, adjuntos, conexión bancaria o publicación en tiendas móviles inicialmente.

## 3. Pantallas

### Hoy

- Fecha local según la zona horaria configurada.
- Hasta tres tareas seleccionadas como prioridades del día.
- Tareas planeadas para hoy y apartado separado de vencidas.
- Hábitos de días fijos que correspondan hoy.
- Metas semanales flexibles y acción «Hecho hoy».
- Acceso rápido para añadir tarea o hábito.
- Objetivos semanales alcanzados en un apartado discreto.
- Una tarea aparece una sola vez en la pantalla aunque cumpla varios filtros.

Seleccionar una tarea entre las tres de hoy no cambia su prioridad general. Una tarea vencida no cambia de fecha automáticamente.

### Tareas

- Vistas iniciales: Todas, Hoy, Próximas, Sin fecha y Completadas.
- Todas muestra tareas activas pendientes; el nombre debe acompañarse de un contador o aclaración para evitar confundirlo con el historial.
- Próximas: tareas pendientes con fecha planeada o límite dentro de los próximos siete días, excluido hoy.
- Sin fecha: sin fecha planeada y sin fecha límite.
- Filtros: estado, etiquetas, prioridad, rango de fecha planeada y rango de fecha límite.
- Orden por creación, prioridad, fecha planeada o fecha límite; fechas vacías al final.
- Las vistas guardan el filtro y el orden, no duplican tareas.
- Dentro de etiquetas se elige «cualquiera» o «todas»; los distintos tipos de filtro se combinan con AND.

Formulario: título obligatorio de hasta 200 caracteres; notas de hasta 5.000; prioridad sin prioridad/baja/media/alta; etiquetas; fecha planeada; fecha límite; duración estimada opcional en minutos enteros positivos.

Fechas almacenadas como fechas de calendario, sin hora. Se permite planear después del vencimiento con una advertencia, porque reprogramar no elimina la fecha límite real. Los detalles permiten editar, archivar y enviar a papelera.

Completar guarda la fecha y hora de la acción. Desmarcar vuelve a pendiente. Archivar conserva datos y los oculta de las vistas activas. Eliminar mueve a papelera; vaciarla requiere confirmación.

### Hábitos

Formulario: nombre obligatorio, descripción opcional, etiqueta, icono, color, fecha de inicio y modalidad:

1. Días fijos: seleccionar al menos un día de la semana.
2. Meta flexible: entre uno y siete días distintos por semana.

Un hábito tiene como máximo un cumplimiento por fecha. Esta versión no mide cantidades acumuladas, litros ni repeticiones. Se puede definir «Leer 10 minutos» como criterio descriptivo de cumplimiento.

Seguimiento: días fijos y metas flexibles claramente diferenciados. En móvil, tarjetas y selector de fecha; en PC, espacio para una semana completa. Detalle con historial, edición, pausa, archivo y eliminación.

Estadísticas: actividad diaria, progreso semanal, calendario mensual y comparación. No atribuir fallos a días futuros. Mostrar siempre cantidades junto a porcentajes y separar periodos en curso de periodos cerrados.

### Ajustes

- Apariencia: sistema, claro y oscuro.
- Inicio de semana y zona horaria.
- Administración de etiquetas; renombrar conserva las relaciones y eliminar una etiqueta no elimina registros.
- Respaldo completo, restauración y fecha del último respaldo exportado.
- Papelera y elementos archivados.
- Información sobre almacenamiento, privacidad y versión.
- Restablecer todos los datos mediante una confirmación explícita y opción previa de exportar.

## 4. Reglas de hábitos y estadísticas

### Días fijos

Una oportunidad es una fecha programada posterior o igual al inicio del hábito, anterior al archivo y fuera de sus pausas. Una fecha no programada es neutra. No se añaden cumplimientos extra en fechas no programadas en la primera versión.

- Hoy: pendiente hasta el cierre del día si no se ha marcado.
- Una fecha programada pasada sin registro: no realizada.
- Futuro: programado, nunca fallido.
- Porcentaje de periodos cerrados: cumplimientos / oportunidades × 100.
- Sin oportunidades: «No aplica», nunca 0 %.

En una semana o mes abierto mostrar progreso «X realizados de Y programados» y estado «En curso», evitando presentarlo como tasa final de éxito.

### Meta flexible semanal

- Se cuentan fechas distintas con registro; cada fecha suma como máximo uno.
- Ejemplo: 4 días objetivo y 4 realizados = 100 %; el quinto se registra como extra, manteniendo el porcentaje en 100 %.
- Durante la semana: «2 de 4 días · En curso».
- Al cierre: porcentaje = mínimo(realizados / objetivo, 1) × 100.
- No se clasifican individualmente como fallidos los días sin actividad.

Semanas parciales por inicio, pausa o archivo: se muestran registros y la etiqueta «Semana parcial», pero no se incluyen en la comparación de cumplimiento. El usuario puede comenzar a registrar de inmediato; la primera evaluación completa inicia en la siguiente semana íntegra. Así no se inventa una meta proporcional ni se exige recuperar días anteriores al inicio.

### Resumen mensual y comparación

- Días fijos: oportunidades de ese mes, según las reglas anteriores.
- Metas flexibles: calendario de días realizados; resultado mensual basado en semanas completas cuyo último día cae dentro del mes. Mostrar el intervalo y número de semanas incluidas.
- Para metas flexibles, usar cumplimientos acreditados por semana (limitados al objetivo) / suma de objetivos de semanas elegibles; no promediar porcentajes sin considerar sus denominadores.
- Comparar únicamente periodos cerrados y elegibles. Mostrar «pocos datos» si hay menos de cuatro oportunidades en días fijos o cuatro semanas elegibles en modalidad flexible; no presentar estos casos como mejores o peores.
- No mezclar actividad diaria con cumplimiento semanal en un porcentaje global.

### Correcciones, pausas y cambios

- No permitir registros futuros ni anteriores al inicio.
- Permitir corregir fechas pasadas elegibles y recalcular estadísticas.
- Durante una pausa no hay oportunidades; no se agregan registros nuevos en esas fechas.
- Pausar se aplica desde hoy o una fecha futura; si hoy ya tiene un registro, la pausa comienza mañana. Reanudar vuelve a activar desde la fecha elegida, sin convertir los días pausados en fallos.
- Editar nombre, icono o color no cambia el historial.
- Cambiar frecuencia crea una nueva versión de la regla, efectiva desde la siguiente semana. No reinterpreta semanas anteriores.
- Archivar conserva estadísticas; reactivar abre una nueva etapa, excluyendo el intervalo archivado.
- Las eliminaciones pasan por papelera. Restaurar devuelve registros y versiones de reglas asociados.

## 5. Fechas y accesibilidad

- Configurar inicialmente zona horaria desde el dispositivo, con America/Mexico_City como ejemplo del usuario actual.
- Guardar fechas de registro de hábito como fechas locales y conservarlas al viajar.
- Guardar eventos técnicos como creación/modificación en UTC.
- Fijar el inicio de semana al crear el historial de un hábito. Cambiar la preferencia afecta a hábitos nuevos; no reagrupar estadísticas pasadas silenciosamente.
- Controles accesibles por teclado, etiquetas explícitas, foco visible y objetivos táctiles cómodos.
- No depender solo de color para prioridad o cumplimiento.
- Respetar reducción de movimiento y comprobar claro/oscuro.
- Adaptación desde 320 px, sin desplazamiento horizontal para acciones principales.
- Diseñar estados vacíos, errores de guardado, almacenamiento insuficiente y recuperación.

## 6. Datos, respaldo y privacidad

El almacenamiento local puede perderse al borrar datos del navegador, desinstalar según la plataforma o por problemas del dispositivo. No presentarlo como respaldo permanente. La aplicación mostrará si está lista para trabajar sin conexión y si la última operación se guardó.

Respaldo JSON completo con versión de esquema, fecha de exportación y todos los registros necesarios. Incluye etiquetas, vistas, reglas históricas, registros de hábitos, pausas, tareas, preferencias, archivos y papelera.

La importación reemplaza la base local, sin combinarla. Flujo: seleccionar archivo → validar estructura, límites y relaciones → resumen de contenido → ofrecer exportar datos actuales → confirmar → reemplazar en una transacción. Si falla, conservar intacta la base anterior. Rechazar versiones incompatibles con explicación legible.

El archivo de respaldo contiene información privada y no estará cifrado en esta primera versión: indicarlo al exportar y recomendar guardarlo en un lugar privado. No exportar secretos o sesiones.

No recolectar analítica, ubicación precisa, tarjetas o credenciales. No enviar tareas ni hábitos a servicios externos. El alojamiento, si se usa, puede tener registros técnicos de acceso; debe revisarse y explicarse antes de publicar. Sin claves secretas en el cliente.

Usar renderizado seguro del texto, validar datos importados, limitar dependencias, servir mediante HTTPS cuando se aloje y evitar registrar notas personales en errores. El almacenamiento local no equivale a cifrado ni protege contra alguien con acceso al perfil del dispositivo.

## 7. Arquitectura propuesta

- TypeScript y React para la interfaz web.
- IndexedDB para persistencia local; seleccionar biblioteca y versiones en la preparación técnica.
- Reglas de dominio independientes de interfaz y almacenamiento.
- Acceso a datos mediante repositorios para poder cambiar el almacenamiento después.
- PWA con caché de recursos necesarios y actualizaciones controladas.
- Gráficas calculadas desde registros; no mantener porcentajes duplicados como fuente de verdad.
- Sin backend durante la primera versión.

Entidades: Task, Tag, TaskTag, SavedView, DailyFocus, Habit, HabitScheduleVersion, HabitRecord, HabitPause, HabitLifecyclePeriod y Settings. Los registros eliminables incluyen estado de archivo/papelera. Cada registro principal tendrá UUID, createdAt, updatedAt y versión de esquema cuando corresponda. HabitRecord debe ser único por hábito y fecha.

La sincronización futura requerirá además autenticación, control de acceso, cola de operaciones, versiones/conflictos, borrados sincronizados y reintentos idempotentes. Reservar campos no significa que la sincronización ya exista. No elegir proveedor gratuito sin comprobar sus límites vigentes.

## 8. Criterios de aceptación principales

1. Crear o completar una tarea sin internet, recargar y conservar el cambio.
2. Completar desde Hoy actualiza Tareas y viceversa sin duplicados.
3. Una vista guardada conserva filtros y se actualiza al cambiar los datos.
4. Leer solo los sábados no considera fallos los demás días.
5. Calistenia cuatro días por semana alcanza 100 % con cuatro fechas distintas; un quinto día no supera 100 %.
6. Una semana abierta no etiqueta días futuros como incumplidos; una semana parcial se identifica y excluye de la comparación.
7. Cambiar la frecuencia no modifica cálculos históricos.
8. Exportar y restaurar reproduce tareas, hábitos, reglas, pausas y preferencias. Un archivo inválido no destruye datos.
9. Un error al guardar nunca muestra una confirmación falsa.
10. Las funciones principales son utilizables en Android y PC, por teclado y con ancho móvil.

## 9. Evolución posterior

Primero validar el uso personal. Después evaluar sincronización sin coste, según límites reales y requisitos; luego rutinas, compras/pagos y consumo de productos. Incorporar graduación y revisiones de mantenimiento sin fabricar cumplimientos diarios. Añadir IA únicamente con valor demostrado, presupuesto, proveedor revisado y consentimiento específico. Antes de abrirla a otras personas, revisar seguridad, obligaciones legales y políticas según países y edades.
