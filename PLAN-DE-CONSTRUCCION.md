# Ritmo — lista de construcción

Fecha: 4 de noviembre de 2026.
Referencia: [Requisitos](REQUISITOS.md).
Estado al 9 de noviembre de 2026: base técnica, tareas, hábitos y respaldos implementados. Recarga, escritura y exportación con servidor detenido verificadas en navegador; Android físico pendiente. Ver VALIDACION.md.

## Etapa 1 — base técnica y prueba de persistencia

- [x] Comprobar herramientas disponibles y elegir versiones compatibles.
- [x] Crear React + TypeScript y estructura por módulos.
- [x] Separar dominio, repositorios, almacenamiento e interfaz.
- [x] Definir esquema IndexedDB y migración inicial.
- [x] Probar escritura, lectura, recarga y error de almacenamiento. Recarga y creación comprobadas con el servidor detenido; fallos cubiertos por pruebas automáticas.
- [x] Preparar funcionamiento PWA sin conexión. Manifiesto y service worker generados; apertura y guardado sin servidor verificados.
- [ ] Decidir alojamiento solo si hace falta probar instalación en teléfono; comprobar coste cero y límites antes de usarlo.

Salida: una tarea de prueba persiste sin conexión después de recargar. Sin servicios de pago ni sincronización.

## Etapa 2 — tareas y navegación

- [x] Construir navegación Hoy/Tareas/Hábitos/Ajustes y diseño adaptable.
- [x] Crear y editar tareas con validación y campos opcionales.
- [x] Completar, deshacer, archivar y enviar a papelera.
- [x] Administrar etiquetas.
- [x] Implementar vistas iniciales y vistas guardadas con filtros y orden.
- [x] Implementar selección de hasta tres prioridades del día.
- [x] Mostrar vencidas por separado y evitar duplicados en Hoy.
- [x] Añadir estados vacíos, errores y confirmación real de guardado.

Salida: lista de tareas utilizable diariamente, con datos reales locales.

## Etapa 3 — hábitos y reglas

- [x] Crear/editar hábitos de días fijos y metas semanales flexibles.
- [x] Registrar una vez por fecha, desmarcar y corregir fechas pasadas.
- [x] Implementar versiones de frecuencia, pausas y periodos de archivo.
- [x] Integrar hábitos en Hoy.
- [x] Calcular periodos abiertos/cerrados, semanas parciales y oportunidades elegibles.
- [x] Mostrar avance semanal, calendario mensual y comparación con denominadores.
- [x] Añadir reconocimientos breves, sin IA y sin atribuciones de citas inventadas.

Salida: cálculos correctos para días fijos, metas flexibles y modificaciones históricas.

## Etapa 4 — respaldo y ajustes

- [x] Exportar respaldo versionado de todas las entidades.
- [x] Validar importación y mostrar resumen antes de confirmar reemplazo.
- [x] Restaurar en transacción y probar recuperación ante fallo.
- [x] Incorporar preferencias, tema, papelera y archivo.
- [x] Explicar almacenamiento local y privacidad del respaldo.
- [x] Recordatorio discreto de respaldo y fecha de última exportación.

Salida: se puede recuperar la información sin perder relaciones ni historial.

## Etapa 5 — verificación para uso personal

- [x] Pruebas de reglas de hábito: días fijos, 4/4, 5/4, fechas futuras, pausas, semanas parciales y cruce de mes/año.
- [x] Pruebas de cambios de zona horaria, reglas de frecuencia y día inicial de semana. Se verifica que el calendario de un hábito existente no se reinterprete.
- [x] Prueba de restricciones únicas de registros e integridad del respaldo.
- [x] Prueba de importación inválida, versión incompatible y fallo de escritura.
- [ ] Prueba de integración: misma tarea o hábito actualizado desde dos pantallas.
- [ ] Probar sin conexión tras primera carga, recarga y actualización de la app.
- [ ] Verificar Android y navegador de PC, anchos pequeños, teclado, contraste y reducción de movimiento.
- [ ] Confirmar ausencia de claves secretas y envío de contenido personal.
- [ ] Usar la app al menos una semana con respaldo y anotar problemas reales.

Avance: 31 pruebas y compilación aprobadas; salto por teclado y cuatro pantallas a 360 px comprobados. Escrituras de hábitos desde dos conexiones cubiertas; integración entre pantallas pendiente. Guía operativa en PRUEBA-PERSONAL.md. La revisión de código no encontró claves ni llamadas externas de envío; falta auditoría integral.

Salida: versión personal lista para uso cotidiano. No afirmar compatibilidad con plataformas que no se hayan probado.

## Orden y control de alcance

Completar las etapas en orden. La estructura del respaldo se define en la base técnica aunque su pantalla se implemente más tarde. No añadir backend, IA, rutinas o pagos para desbloquear tareas de la primera versión. Registrar cambios de alcance antes de implementarlos.

No se fija una fecha de entrega. Las etapas 1–4 están implementadas: tareas, hábitos, estadísticas, respaldo y ajustes. La siguiente etapa es la verificación para uso personal; instalación en Android y revisión de dependencias siguen pendientes.

## Backlog posterior

- Sincronización Android/PC, cuentas y recuperación de acceso.
- Notificaciones y recordatorios con limitaciones por plataforma verificadas.
- Graduación de hábitos y revisión de mantenimiento.
- Rutinas diaria/semanal, bloques fijos y movibles.
- Compras, suscripciones, fechas de cancelación y recordatorios.
- Productos: compra, apertura, agotamiento, cantidad, tienda y precio por unidad.
- Asistente opcional, consentimiento, minimización de datos y límites de gasto.
- Compatibilidad probada con iPhone y evaluación de app nativa si se necesita.
