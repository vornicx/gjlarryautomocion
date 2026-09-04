export const vehicles = [
  {
    slug: 'bmw-x3-xdrive-30d-m-sport-2024',
    brand: 'BMW',
    model: 'X3 xDrive 30d M Sport',
    year: 2024,
    km: 35874,
    fuel: 'Diésel',
    gear: 'Automático',
    power: '286 CV',
    drive: 'xDrive 4x4',
    price: 49900,
    image: 'https://images.unsplash.com/photo-1657365595932-894b00d4af62?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=82&w=1800',
    imageNote: 'Imagen de apoyo. Consulta las fotos reales del vehículo en Instagram.',
    sourceUrl: 'https://www.instagram.com/gj_larry_automocion/p/Dc3TSXFIW1q/',
    publishedAt: '2026-09-04',
    desc: 'SUV premium con motor diésel de 286 CV, cambio automático, tracción integral xDrive y acabado M Sport.',
    equipment: [
      'Paquete M Sport',
      'Techo panorámico',
      'Asientos de cuero eléctricos con memoria',
      'Climatizador de 3 zonas',
      'Navegador',
      'Apple CarPlay / Android Auto',
      'Cámara trasera y cámaras de asistencia',
      'Sensores de aparcamiento',
      'Faros LED',
      'Llantas M Sport',
      'Modos Sport / Comfort / Eco Pro',
      'Cuadro digital'
    ]
  }
];

export const business = {
  name: 'GJ Larry Automoción',
  phone: '651 360 765',
  phoneRaw: '34651360765',
  location: 'La Luisiana (Sevilla)',
  instagram: 'https://www.instagram.com/gj_larry_automocion/',
  instagramHandle: '@gj_larry_automocion'
};

export const euro = n => new Intl.NumberFormat('es-ES', {
  style: 'currency', currency: 'EUR', maximumFractionDigits: 0
}).format(n);
export const km = n => new Intl.NumberFormat('es-ES').format(n) + ' km';
