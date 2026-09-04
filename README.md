# GJ Larry Automoción — web comercial

Web estática responsive inspirada en la lógica comercial de un concesionario de ocasión: stock visible, ficha clara, contacto directo y servicios complementarios.

## Datos verificados usados
- Instagram oficial: `@gj_larry_automocion`
- Teléfono publicado: `651 360 765`
- Ubicación publicada: La Luisiana (Sevilla)
- Stock publicado el 4/09/2026: BMW X3 xDrive 30d M Sport, 2024, 35.874 km, diésel, automático, 286 CV, xDrive 4x4, 49.900 €.
- El negocio también publica trabajos de limpieza/detailing premium.

## Nota sobre imágenes
Las fotografías del stock actual están en Instagram. La web usa una imagen de apoyo en la ficha para no depender de URLs temporales del CDN de Instagram y enlaza la publicación original para ver las fotos reales. Para producción, subir las fotografías originales del negocio a `/assets` y sustituir el campo `image` en `js/data.js`.

## Estructura
- `index.html`: home, stock, detailing, valoración y contacto.
- `vehiculos.html`: catálogo.
- `vehiculo.html?slug=...`: ficha dinámica.
- `js/data.js`: inventario y datos de negocio centralizados.
- `vercel.json`: configuración básica para Vercel.

## Desarrollo local
```bash
python3 -m http.server 4173
```
Abrir `http://localhost:4173`.
