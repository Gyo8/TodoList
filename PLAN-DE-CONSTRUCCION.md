# Ritmo — lista de construcción

Fecha: 4 de noviembre de 2026.
Referencia: [Requisitos](REQUISITOS.md).
Estado al 8 de noviembre de 2026: base técnica implementada; comprobación real en navegador y Android pendiente. Ver VALIDACION.md.

## Etapa 1 — base técnica y prueba de persistencia

- [x] Comprobar herramientas disponibles y elegir versiones compatibles.
- [x] Crear React + TypeScript y estructura por módulos.
- [x] Separar dominio, repositorios, almacenamiento e interfaz.
- [x] Definir esquema IndexedDB y migración inicial.
- [ ] Probar escritura, lectura, recarga y error de almacenamiento. Pruebas automáticas de reapertura y fallos aprobadas; falta recarga real sin conexión.
- [x] Preparar funcionamiento PWA sin conexión. Manifiesto y service worker generados; comprobación real pendiente.
- [ ] Decidir alojamiento solo si hace falta probar instalación en teléfono; comprobar coste cero y límites antes de usarlo.

Salida: una tarea de prueba persiste sin conexión después de recargar. Sin servicios de pago ni sincronización.

## Etapa 2 — tareas y navegación

- [ ] Construir navegación Hoy/Tareas/Hábitos/Ajustes y diseño adaptable.
- [ ] Crear y editar tareas con validación y campos opcionales.
- [ ] Completar, deshacer, archivar y enviar a papelera.
- [ ] Administrar etiquetas.
- [ ] Implementar vistas iniciales y vistas guardadas con filtros y orden.
- [ ] Implementar selección de hasta tres prioridades del día.
- [ ] Mostrar vencidas por separado y evitar duplicados en Hoy.
- [ ] Añadir estados vacíos, errores y confirmación real de guardado.

Salida: lista de tareas utilizable diariamente, con datos reales locales.

## Etapa 3 — hábitos y reglas

- [ ] Crear/editar hábitos de días fijos y metas semanales flexibles.
- [ ] Registrar una vez por fecha, desmarcar y corregir fechas pasadas.
- [ ] Implementar versiones de frecuencia, pausas y periodos de archivo.
- [ ] Integrar hábitos en Hoy.
- [ ] Calcular periodos abiertos/cerrados, semanas parciales y oportunidades elegibles.
- [ ] Mostrar avance semanal, calendario mensual y comparación con denominadores.
- [ ] Añadir reconocimientos breves, sin IA y sin atribuciones de citas inventadas.

Salida: cálculos correctos para días fijos, metas flexibles y modificaciones históricas.

## Etapa 4 — respaldo y ajustes

- [ ] Exportar respaldo versionado de todas las entidades.
- [ ] Validar importación y mostrar resumen antes de confirmar reemplazo.
- [ ] Restaurar en transacción y probar recuperación ante fallo.
- [ ] Incorporar preferencias, tema, papelera y archivo.
- [ ] Explicar almacenamiento local y privacidad del respaldo.
- [ ] Recordatorio discreto de respaldo y fecha de última exportación.

Salida: se puede recuperar la información sin perder relaciones ni historial.

## Etapa 5 — verificación para uso personal

- [ ] Pruebas de reglas de hábito: días fijos, 4/4, 5/4, fechas futuras, pausas, semanas parciales y cruce de mes/año.
- [ ] Pruebas de cambios de zona horaria, reglas de frecuencia y día inicial de semana.
- [ ] Prueba de restricciones únicas de registros e integridad del respaldo.
- [ ] Prueba de importación inválida, versión incompatible y fallo de escritura.
- [ ] Prueba de integración: misma tarea o hábito actualizado desde dos pantallas.
- [ ] Probar sin conexión tras primera carga, recarga y actualización de la app.
- [ ] Verificar Android y navegador de PC, anchos pequeños, teclado, contraste y reducción de movimiento.
- [ ] Confirmar ausencia de claves secretas y envío de contenido personal.
- [ ] Usar la app al menos una semana con respaldo y anotar problemas reales.

Salida: versión personal lista para uso cotidiano. No afirmar compatibilidad con plataformas que no se hayan probado.

## Orden y control de alcance

Completar las etapas en orden. La estructura del respaldo se define en la base técnica aunque su pantalla se implemente más tarde. No añadir backend, IA, rutinas o pagos para desbloquear tareas de la primera versión. Registrar cambios de alcance antes de implementarlos.

No se fija una fecha de entrega. La etapa 1 comenzó con autorización del usuario; completar la verificación en navegador antes de declarar terminada la prueba técnica. La interfaz incorpora una parte mínima de tareas para comprobar persistencia, sin adelantar todo el alcance de la etapa 2.

## Backlog posterior

- Sincronización Android/PC, cuentas y recuperación de acceso.
- Notificaciones y recordatorios con limitaciones por plataforma verificadas.
- Graduación de hábitos y revisión de mantenimiento.
- Rutinas diaria/semanal, bloques fijos y movibles.
- Compras, suscripciones, fechas de cancelación y recordatorios.
- Productos: compra, apertura, agotamiento, cantidad, tienda y precio por unidad.
- Asistente opcional, consentimiento, minimización de datos y límites de gasto.
- Compatibilidad probada con iPhone y evaluación de app nativa si se necesita.
