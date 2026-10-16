# MediControl

Prototipo web de gestión de medicamentos orientado a personas adultas mayores.

## Ejecutar

1. Descomprime el archivo ZIP.
2. Abre la carpeta `MediControl` en Visual Studio Code.
3. Abre `index.html` con Live Server o con un servidor web local.

## Mejoras incluidas en esta versión

- Interfaz con jerarquía visual más consistente, tipografía legible y controles más claros.
- Nueva sección **Planes y suscripción** con plan Gratis, plan MediControl Plus a S/ 9.90/mes y prueba de 30 días.
- Estado de prueba guardado en el navegador para la demostración; permite ver los días restantes.
- Eliminación de medicamentos, recordatorios, tomas e historiales ficticios de la vista del paciente.
- Estados vacíos con instrucciones claras para cuentas sin registros.
- Calendario que inicia en el mes actual y no muestra tomas inventadas.
- Perfil sin nombres de ejemplo predefinidos.

## Alcance y límites importantes

Esta entrega sigue siendo un **prototipo front-end**. La prueba Premium se simula con `localStorage`; no se procesan pagos ni se renueva una suscripción real. Para un lanzamiento público se requiere autenticación segura, base de datos con permisos por usuario, copias de seguridad, integración con una pasarela de pago y revisión de privacidad/protección de datos. No uses datos reales de salud en esta versión de demostración.

## Mejoras de esta versión

- Confirmación de tomas desde cada tarjeta de medicamento, sin una sección adicional en Inicio.
- Confirmación explícita de cada toma desde el panel diario.
- Descuento del inventario solo cuando el paciente confirma una toma.
- Registro de la toma en el historial y actualización del calendario.
- Aviso si el inventario registrado no alcanza para la cantidad de la toma.
- Diseño adaptable y controles amplios para facilitar el uso en adultos mayores.

Los datos de esta versión se guardan en el almacenamiento local del navegador. No se sincronizan entre dispositivos ni sustituyen una base de datos de producción.


## Información automática al registrar un medicamento

- Al escribir el nombre en el formulario **Agregar medicamento**, aparece una ficha educativa cuando el nombre coincide con uno de los medicamentos incluidos.
- Incluye usos habituales, consejos generales, precauciones y un enlace a MedlinePlus.
- Para nombres no reconocidos, la aplicación solicita verificar la información y no inventa una ficha.
- La ficha no determina dosis ni frecuencia; se deben seguir la receta y las instrucciones de la presentación.


## Cambios de esta versión
- Se retiró el asistente de voz del menú y de la pantalla principal.
- La opción del menú ahora es Guía de medicamentos, con la información educativa de los medicamentos registrados.
- Farmacias ya no solicita ubicación ni abre Google Maps. Permite escribir un medicamento y muestra tres tarjetas con precios simulados de demostración y enlaces de consulta de compra/delivery.
- Los precios son ficticios y están rotulados como tales; para uso real, consultar el Observatorio de Precios de DIGEMID.
