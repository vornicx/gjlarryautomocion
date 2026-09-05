import {vehicles,euro,km} from './data.js';
import {wa,escapeHTML as esc,vehicleName} from './app.js';
const mount=document.querySelector('#detailMount');
const slug=new URLSearchParams(location.search).get('slug');
const vehicle=vehicles.find(v=>v.slug===slug);
if(!vehicle) {
  document.title='Vehículo no encontrado | GJ Larry Automoción';
  mount.innerHTML='<div class="not-found"><p class="eyeline">VEHÍCULO NO ENCONTRADO</p><h1>Busquemos<br>otra opción.</h1><p>Esta ficha no está disponible. Consulta nuestra selección o habla con nosotros.</p><a class="btn btn-accent" href="vehiculos.html">Ver vehículos ↗</a></div>';
} else {
  const v=vehicle,name=vehicleName(v),photos=v.gallery;
  document.title=`${v.brand} ${v.model} | GJ Larry Automoción`;
  for(const key of ['meta[name="description"]','meta[property="og:description"]'])document.querySelector(key)?.setAttribute('content',v.desc);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content',document.title);
  const specs=[['Año',v.year],['Kilómetros',v.km===null?null:km(v.km)],['Combustible',v.fuel],['Cambio',v.gear],['Potencia',v.power],['Tracción',v.drive]].filter(([,value])=>value!==null);
  const stats=specs.length?specs:[['Carrocería',v.body],['Color',v.color]];
  mount.innerHTML=`<nav class="detail-breadcrumb" aria-label="Ruta de navegación"><a href="index.html">Inicio</a><span aria-hidden="true">/</span><a href="vehiculos.html">Vehículos</a><span aria-hidden="true">/</span><span>${esc(name)}</span></nav><div class="detail-grid"><div class="detail-gallery"><div class="gallery-main"><button class="gallery-open" type="button" aria-label="Ampliar fotografías de ${esc(name)}"><img id="mainPhoto" src="${photos[0].src}" alt="${esc(photos[0].alt)}" width="${v.imageWidth||1440}" height="${v.imageHeight||1080}" fetchpriority="high"><span class="gallery-enlarge">Ver galería <span aria-hidden="true">↗</span></span></button></div><div class="gallery-toolbar"><p id="galleryCounter" aria-live="polite">1 / ${photos.length} · Fotografías reales</p><div class="gallery-arrows"><button class="gallery-arrow" data-photo-prev aria-label="Fotografía anterior">←</button><button class="gallery-arrow" data-photo-next aria-label="Fotografía siguiente">→</button></div></div><div class="gallery-thumbs" aria-label="Elegir fotografía">${photos.map((p,i)=>`<button class="gallery-thumb" data-photo="${i}" type="button" aria-pressed="${i===0}" aria-label="Foto ${i+1}: ${esc(p.alt)}"><img src="${p.src.replace('.webp','-sm.webp')}" alt="" width="100" height="72" loading="lazy"></button>`).join('')}</div></div><div class="detail-content"><section class="detail-description"><h2>Conócelo de cerca.</h2><p>${esc(v.desc)}</p>${v.price===null?'<p>Consúltanos la versión, el año, los kilómetros y el precio de esta unidad. Te damos la información antes de organizar tu visita.</p>':''}</section>${v.equipment.length?`<section class="equipment-section"><h2>Todo está en los detalles.</h2><ul class="equipment-grid">${v.equipment.map(item=>`<li>${esc(item)}</li>`).join('')}</ul><a class="detail-source" href="${v.sourceUrl}" target="_blank" rel="noopener">Ver publicación del vehículo en Instagram ↗</a></section>`:''}</div><aside class="detail-panel"><p class="eyeline">LA SELECCIÓN GJ LARRY</p><h1>${esc(name)}</h1>${v.shortModel!==v.model?`<p class="detail-version">${esc(v.model.replace(v.shortModel,'').trim())}</p>`:''}<p class="detail-price${v.price===null?' unknown':''}">${euro(v.price)}</p><p class="availability-note">Confirma ${v.price===null?'precio y ':''}disponibilidad antes de tu visita.</p><dl class="detail-kv">${stats.map(([key,value])=>`<div><dt>${key}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl><div class="detail-panel-actions"><a class="btn btn-accent" href="${wa(`Hola, me interesa el ${v.brand} ${v.model}${v.price!==null?' de '+euro(v.price):''}. ¿Podéis confirmarme su precio y disponibilidad?`)}" target="_blank" rel="noopener">Me interesa este coche <span aria-hidden="true">↗</span></a><a class="text-link" href="tel:+34651360765">O llámanos al 651 360 765</a></div></aside></div><div class="detail-callouts"><article class="detail-callout"><h3>Hablemos de financiación.</h3><p>Consulta las opciones y condiciones para esta unidad.</p><a class="text-link" href="${wa(`Hola, quiero consultar financiación para el ${v.brand} ${v.model}.`)}" target="_blank" rel="noopener">Consultar financiación ↗</a></article><article class="detail-callout"><h3>¿Entregas tu coche?</h3><p>Podemos empezar con su marca, modelo, año y kilómetros.</p><a class="text-link" href="${wa(`Hola, me interesa el ${v.brand} ${v.model} y quiero valorar mi coche actual.`)}" target="_blank" rel="noopener">Valorar mi coche ↗</a></article></div><dialog class="photo-dialog" id="photoDialog" aria-labelledby="photoDialogTitle"><div class="photo-dialog-top"><p id="photoDialogTitle">${esc(name)} · Galería</p><button class="dialog-close" aria-label="Cerrar galería" type="button">×</button></div><img class="photo-dialog-image" id="dialogPhoto" src="${photos[0].src}" alt="${esc(photos[0].alt)}" width="1440" height="1080"><div class="photo-dialog-bottom"><p id="dialogCounter" aria-live="polite">1 / ${photos.length}</p><div class="gallery-arrows"><button class="gallery-arrow" data-photo-prev aria-label="Fotografía anterior">←</button><button class="gallery-arrow" data-photo-next aria-label="Fotografía siguiente">→</button></div></div></dialog>`;
  let index=0;
  const main=document.querySelector('#mainPhoto'),dialog=document.querySelector('#photoDialog'),large=document.querySelector('#dialogPhoto'),thumbs=[...document.querySelectorAll('[data-photo]')];
  function show(next){
    index=(next+photos.length)%photos.length;const p=photos[index];
    main.src=p.src;main.alt=p.alt;large.src=p.src;large.alt=p.alt;
    document.querySelector('#galleryCounter').textContent=`${index+1} / ${photos.length} · Fotografías reales`;
    document.querySelector('#dialogCounter').textContent=`${index+1} / ${photos.length}`;
    thumbs.forEach((t,i)=>t.setAttribute('aria-pressed',String(i===index)));
  }
  thumbs.forEach((t,i)=>t.addEventListener('click',()=>show(i)));
  document.querySelectorAll('[data-photo-prev]').forEach(b=>b.addEventListener('click',()=>show(index-1)));
  document.querySelectorAll('[data-photo-next]').forEach(b=>b.addEventListener('click',()=>show(index+1)));
  document.querySelector('.gallery-open').addEventListener('click',()=>dialog.showModal());
  dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();show(index+(e.key==='ArrowRight'?1:-1));}});
  dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))dialog.close();});
  // A horizontal swipe changes photographs; vertical gestures retain native page scrolling.
  for(const el of [document.querySelector('.gallery-open'),large]) {
    let start=null;
    el.addEventListener('touchstart',e=>{start=e.touches.length===1?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null;},{passive:true});
    el.addEventListener('touchend',e=>{if(!start)return;const t=e.changedTouches[0],dx=t.clientX-start.x,dy=t.clientY-start.y;start=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.5)show(index+(dx<0?1:-1));},{passive:true});
    el.addEventListener('touchcancel',()=>{start=null;},{passive:true});
  }
}
