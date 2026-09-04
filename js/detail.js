import {vehicles,euro,km,dateEs} from './data.js';
import {wa} from './app.js';
const mount=document.querySelector('#detailMount');
const slug=new URLSearchParams(location.search).get('slug');
const v=vehicles.find(x=>x.slug===slug)||vehicles[0];
if(v&&mount){
  document.title=`${v.brand} ${v.model} | GJ Larry Automoción`;
  const msg=wa(`Hola, quiero información sobre el ${v.brand} ${v.model} de ${euro(v.price)}.`);
  mount.innerHTML=`
    <div class="detail-breadcrumb"><a href="vehiculos.html">Vehículos</a> / ${v.brand} ${v.model}</div>
    <div class="detail-grid">
      <div class="detail-gallery"><img src="${v.image}" alt="Imagen de presentación de ${v.brand} ${v.model}"><div class="detail-gallery-note">${v.imageNote} <a href="${v.sourceUrl}" target="_blank" rel="noopener">Ver publicación original ↗</a></div></div>
      <aside class="detail-panel"><p class="eyeline">En stock · publicado ${dateEs(v.publishedAt)}</p><h1>${v.brand}<br>${v.model}</h1><p class="lead">${v.desc}</p><div class="detail-price">${euro(v.price)}</div><div class="detail-kv"><div><span>Año</span><strong>${v.year}</strong></div><div><span>Kilómetros</span><strong>${km(v.km)}</strong></div><div><span>Combustible</span><strong>${v.fuel}</strong></div><div><span>Cambio</span><strong>${v.gear}</strong></div><div><span>Potencia</span><strong>${v.power}</strong></div><div><span>Tracción</span><strong>${v.drive}</strong></div></div><div class="detail-panel-actions"><a class="btn btn-gold" href="${msg}" target="_blank" rel="noopener">Consultar por WhatsApp</a><a class="btn" style="border-color:#c9c8c3;color:#111" href="tel:+34651360765">Llamar</a></div></aside>
    </div>
    <section class="equipment-section"><p class="eyeline">Equipamiento destacado</p><h2>Una configuración muy completa.</h2><div class="equipment-grid">${v.equipment.map(x=>`<div>${x}</div>`).join('')}</div></section>
    <div class="detail-callouts"><article class="detail-callout"><p class="eyeline">Financiación</p><h3>Consulta opciones.</h3><p>Te ayudamos a estudiar una fórmula de financiación para esta unidad.</p><a class="btn btn-gold" href="${wa(`Hola, quiero consultar financiación para el ${v.brand} ${v.model}.`)}" target="_blank" rel="noopener">Financiación</a></article><article class="detail-callout"><p class="eyeline">¿Entregas tu coche?</p><h3>Lo valoramos.</h3><p>Envíanos marca, modelo, año y kilómetros para iniciar la conversación.</p><a class="btn btn-outline" href="${wa(`Hola, me interesa el ${v.brand} ${v.model} y quiero entregar/tasar mi coche actual.`)}" target="_blank" rel="noopener">Tasación</a></article></div>`;
}
