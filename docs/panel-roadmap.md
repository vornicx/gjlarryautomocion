# Panel GJ Larry — conexión real

Proyecto Supabase: `sqniuavyijyrfigwyipw`, región eu-west-1.

## Implementado

- Inicio de sesión con contraseña de Supabase Auth. No hay formulario de registro.
- Sesión solo en memoria, con renovación durante el uso; al recargar se vuelve a entrar.
- Lista privada de operadores. Una cuenta autenticada no basta para gestionar.
- Altas, edición, fotografías, estados y retirada reversible.
- Guardado condicionado a versión para detectar cambios simultáneos.
- Galería atómica dentro de la ficha, hasta 20 fotos. Imágenes optimizadas a JPEG.
- Bucket privado; URLs de fotos firmadas durante una hora. Retirar una ficha
  impide crear nuevos enlaces públicos, pero los ya emitidos duran hasta caducar.
- Catálogo, portada y detalle consultan Supabase. Sin copia estática de respaldo
  que pueda volver a mostrar vehículos retirados si falla la conexión.
- Los cinco coches originales están migrados. Las fotos originales siguen siendo
  assets públicos; las nuevas cargas usan Storage.

## Validado

`database/fleet-access-test.sql` se ejecutó y revirtió sus fixtures: lectura
pública, denegación de borradores, escritura anónima y de no-operadores,
edición autorizada, conflicto de versión, publicación sin fotos rechazada,
privilegios no autoasignables y retirada reversible. Asesor de seguridad sin avisos.

## Activación del primer operador

Pendiente elegir el correo del propietario e invitarlo desde Auth. No se han
creado contraseñas ni enviado invitaciones. Tras verificar el usuario en Auth,
un administrador añade su UUID a `larry_private.operators` desde SQL Editor.
No introducir la service-role key en la web. Probar el acceso completo con esa
cuenta (incluida carga de fotos) antes de dar por terminada la entrega.

## Pendientes operativos

- Prueba visual móvil y prueba de carga real desde una cuenta autorizada.
- Configurar el envío de recuperación de contraseña y su recorrido.
- Limpieza programada de archivos subidos cuyo guardado se abandona o falla.
  Al retirar fotos de fichas guardadas se intenta borrar el archivo no referenciado.
- Desactivar registro público en la configuración Auth del proyecto. Aunque se
  crease una cuenta por API, carecería de permisos de operador por RLS.
