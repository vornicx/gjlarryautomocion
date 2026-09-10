# Panel GJ Larry — primera versión

## Disponible

`/panel` es una vista previa pública, marcada como tal y excluida de indexación. Solo usa una copia en memoria del inventario ya público. Permite altas, edición, estados, fotos locales, orden de galería y confirmación de eliminación. No representa una sesión privada ni cambia el catálogo. No hay contraseña ficticia ni guardado simulado como permanente.

## Conexión pendiente

Se ha preparado `database/fleet-schema.sql`: inventario validado, operadores
autorizados, lectura pública limitada a publicados/reservados, retirada
reversible y versionado. Es una propuesta ejecutable pendiente de aplicar y
probar en el proyecto dedicado; todavía no activa persistencia en `/panel`.
La API deberá condicionar cada actualización a `id` y `version`, y tratar
cero filas devueltas como conflicto. La galería necesita su propia operación
atómica y políticas de almacenamiento antes de activar cargas reales.

Crear un proyecto Supabase dedicado a GJ Larry, previa elección de organización. No reutilizar Contalab ni los proyectos de otros clientes.

- Auth por invitación; sin registro público de administradores.
- Lista privada de operadores autorizados, administrada fuera del cliente. Autenticación por sí sola no otorga permisos de edición.
- Tabla de vehículos con validación y versión para detectar ediciones simultáneas; borradores excluidos de lectura pública.
- Políticas RLS por operación; visitantes solo pueden leer vehículos publicados. Operadores autorizados gestionan el inventario.
- Storage con límites, validación de imágenes y políticas de acceso. Evitar SVG ejecutable. Gestionar archivos huérfanos.
- API de mutaciones con validación de campos permitidos, autorización, control de concurrencia y registro de cambios.
- Confirmación de borrado identificando el vehículo; preferir retirada reversible antes del borrado definitivo.
- Migrar el catálogo actual y sustituir la carga estática solo después de probar lectura pública, borradores privados y denegación de escritura anónima.
- Conectar secretos mediante variables del entorno de despliegue. Nunca guardar claves privadas en el repo o en JavaScript público.

## Validación antes de activarlo

Probar usuario anónimo, usuario autenticado sin permiso y operador autorizado, tanto en CRUD como en fotos. Probar sesiones caducadas, errores de red, guardado duplicado y dos ediciones concurrentes. Comprobar reflejo del cambio en portada, catálogo y ficha.
