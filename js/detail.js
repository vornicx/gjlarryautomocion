import {vehicles,business,euro,km} from './data.js';
const slug=new URLSearchParams(location.search).get('slug');
const v=vehicles.find(x=>x.slug===slug)||vehicles[0];
const wa=text=>`https://wa.me/${business.phoneRaw}?text=${encodeURIComponent(text)}`;
document.title=`${v.brand} ${v.model} | GJ Larry Automoción`;
document.querySelector('#detailMount').innerHTML=`<div class="detailgrid">
  <div>
    <div class="gallery-main"><img src="${v.image}" alt="Imagen de apoyo para ${v.brand} ${v.model}"></div>
    <div class="media-note">${v.imageNote} <a href="${v.sourceUrl}" target="_blank" rel="noopener">Abrir publicación original ↗</a></div>
  </div>
  <aside class="detail-side">
    <div class="eyeline">Vehículo publicado · ${v.year}</div>
    <h1>${v.brand}<br>${v.model}</h1>
    <div class="sub">${v.gear} · ${v.drive}</div>
    <div class="bigprice">${euro(v.price)}</div>
    <p>${v.desc}</p>
    <div class="kv"><div><span>Kilómetros</span><strong>${km(v.km)}</strong></div><div><span>Combustible</span><strong>${v.fuel}</strong></div><div><span>Cambio</span><strong>${v.gear}</strong></div><div><span>Potencia</span><strong>${v.power}</strong></div></div>
    <div class="actions"><a class="btn" target="_blank" rel="noopener" href="${wa(`Hola, me interesa el ${v.brand} ${v.model} publicado en vuestra web. ¿Sigue disponible?`)}">Preguntar por WhatsApp</a><a class="btn dark" href="tel:+${business.phoneRaw}">Llamar</a></div>
    <div class="equipment"><strong>Equipamiento destacado</strong><ul>${v.equipment.map(x=>`<li>${x}</li>`).join('')}</ul></div>
  </aside>
</div>`;
