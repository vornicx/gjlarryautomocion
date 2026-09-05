# GJ Larry Automoción

Web comercial estática para el catálogo de GJ Larry Automoción, La Luisiana (Sevilla). HTML, CSS y módulos JavaScript, sin dependencias de ejecución.

## Desarrollo y publicación

- `npm run dev`: servidor de desarrollo, puerto 4173 por defecto; acepta `PORT` o `--port`.
- `npm run check`: valida páginas, enlaces, fotografías, fuente, inventario y datos desconocidos.
- `npm run build`: comprueba y copia únicamente las páginas y recursos públicos a `dist/`.
- Vercel ejecuta el build y publica `dist/`; no publica scripts ni documentación.

## Funcionalidad

- Portada con fotografías reales, selección de coches, concesionario, financiación, tasación y detailing.
- Catálogo con filtros dependientes de marca/modelo, combustible, presupuesto y ordenación; filtros conservados en la URL y navegación atrás/adelante.
- Fichas con miniaturas, fotografías ampliables, navegación por teclado y gestos horizontales.
- Tasación con validación: prepara un mensaje de WhatsApp, sin enviar ni almacenar los datos automáticamente.
- Página 404 y estado de vehículo no encontrado. Un slug inválido nunca muestra otro coche.
- Fuente local Manrope (SIL OFL), imágenes WebP responsivas, carga diferida, foco visible y movimiento reducido.

## Inventario y datos pendientes

`js/data.js` es la fuente única. Los valores `null` significan **sin confirmar**, nunca cero. Los coches sin precio quedan fuera de un filtro de presupuesto y se ordenan después de los precios conocidos.

El BMW X3 conserva la ficha del proyecto anterior: 2024, 35.874 km, diésel, automático, 286 CV, xDrive, 49.900 €. Publicación original: https://www.instagram.com/gj_larry_automocion/p/Dc3TSXFIW1q/

BMW X6, Škoda Karoq, Volkswagen Golf y Volkswagen T-Roc se identifican en las fotografías facilitadas. No se infieren precio, año, kilometraje, combustible ni potencia. Se debe confirmar la información comercial y la disponibilidad de todas las unidades con el negocio antes de actualizarla.

## Fotografías

Se revisaron 126 JPG distintos de la carpeta facilitada por el usuario el 05/09/2026. Se prepararon 38 fotografías en dos resoluciones: 36 de vehículos y 2 del negocio. Las galerías no mezclan modelos. `docs/photography-sources.json` conserva la correspondencia exacta con los originales de Drive. Los archivos originales no se publican ni se enlazan desde la interfaz.

## Criterios de diseño consultados

- https://github.com/Leonxlnx/taste-skill — redesign-existing-projects.
- https://github.com/emilkowalski/skills — colección consultada en `d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7`; criterios aplicables de diseño, animación y accesibilidad.

Se conserva la estructura y las rutas existentes. No se incorpora seguimiento publicitario, analítica ni una base de datos. Los textos legales completos y los datos fiscales no se han inventado; deben proceder del titular del negocio.
