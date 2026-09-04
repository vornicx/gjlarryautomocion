import {vehicles,business,euro,km,dateEs} from './data.js';
const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
export const wa=(text='Hola, me gustaría recibir información de GJ Larry Automoción.')=>`https://wa.me/${business.phoneRaw}?text=${encodeURIComponent(text)}`;

export function vehicleCard(v,variant='featured'){
  if(variant==='catalog') return `<article class="catalog-card" data-brand="${v.brand}" data-fuel="${v.fuel}" data-price="${v.price}">
    <a class="catalog-image" href="vehiculo.html?slug=${v.slug}"><img loading="lazy" src="${v.image}" alt="Imagen de presentación de ${v.brand} ${v.model}"><span class="stock-tag">EN STOCK</span></a>
    <div class="catalog-body"><h2>${v.brand} ${v.model}</h2><div class="catalog-sub">${v.year} · ${v.gear} · ${v.drive}</div><div class="catalog-specs"><span>${km(v.km)}</span><span>${v.fuel}</span><span>${v.power}</span></div><div class="catalog-price">${euro(v.price)}</div><div class="catalog-actions"><a href="vehiculo.html?slug=${v.slug}">Ver ficha →</a><a class="source" href="${v.sourceUrl}" target="_blank" rel="noopener">Fotos reales ↗</a></div></div>
  </article>`;
  return `<article class="featured-card" data-reveal>
    <a class="featured-image" href="vehiculo.html?slug=${v.slug}"><img src="${v.image}" alt="Imagen de presentación de ${v.brand} ${v.model}"><span class="stock-tag">EN STOCK</span><span class="verified-tag">Publicado ${dateEs(v.publishedAt)}</span></a>
    <div class="featured-copy"><p class="eyeline">${v.brand}</p><h3>${v.model}</h3><div class="vehicle-sub">${v.year} · ${v.gear} · ${v.drive}</div><div class="spec-list"><div><span>Kilómetros</span><strong>${km(v.km)}</strong></div><div><span>Combustible</span><strong>${v.fuel}</strong></div><div><span>Potencia</span><strong>${v.power}</strong></div><div><span>Tracción</span><strong>${v.drive}</strong></div></div><div class="featured-price">${euro(v.price)}</div><div class="featured-actions"><a class="btn btn-gold" href="vehiculo.html?slug=${v.slug}">Ver ficha</a><a class="btn btn-outline" href="${wa(`Hola, quiero información sobre el ${v.brand} ${v.model} de ${euro(v.price)}.`)}" target="_blank" rel="noopener">Consultar</a></div><div class="source-link">Fotos reales disponibles en <a href="${v.sourceUrl}" target="_blank" rel="noopener">Instagram ↗</a></div></div>
  </article>`;
}

function header(){
  const h=$('.topbar'),menu=$('.menu'),panel=$('.mobilepanel');
  if(h&&!h.classList.contains('topbar-solid')){const on=()=>h.classList.toggle('scrolled',scrollY>18);on();addEventListener('scroll',on,{passive:true});}
  menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-expanded',String(!open));panel?.classList.toggle('open',!open);panel?.setAttribute('aria-hidden',String(open));});
  $$('.mobilepanel a').forEach(a=>a.addEventListener('click',()=>{menu?.setAttribute('aria-expanded','false');panel?.classList.remove('open');panel?.setAttribute('aria-hidden','true');}));
}
function whatsapp(){ $$('[data-wa]').forEach(a=>a.href=wa(a.dataset.wa||undefined)); }
function featured(){
  const grid=$('#featuredGrid'),v=vehicles[0]; if(grid)grid.innerHTML=vehicles.map(x=>vehicleCard(x)).join('');
  const hero=$('#heroVehicle');if(hero&&v)hero.innerHTML=`<span><strong>${v.brand} ${v.model}</strong><small>${km(v.km)} · ${v.power}</small></span><span class="hero-price">${euro(v.price)}</span>`;
  const count=$('#stockCountText');if(count)count.textContent=`${vehicles.length} ${vehicles.length===1?'unidad publicada':'unidades publicadas'}`;
}
function fillSelect(select,items){if(!select)return;items.forEach(x=>{const o=document.createElement('option');o.value=x;o.textContent=x;select.append(o);});}
function quick(){
  const f=$('#quickSearch');if(!f)return;
  fillSelect($('#brandFilter'),[...new Set(vehicles.map(v=>v.brand))]);fillSelect($('#modelFilter'),[...new Set(vehicles.map(v=>v.model))]);fillSelect($('#fuelFilter'),[...new Set(vehicles.map(v=>v.fuel))]);
  f.addEventListener('submit',e=>{e.preventDefault();const d=new FormData(f),q=new URLSearchParams();for(const [k,v] of d.entries())if(v)q.set(k,v);location.href=`vehiculos.html${q.size?'?'+q.toString():''}`;});
}
function valuation(){
  const dialog=$('#valuationDialog');$$('[data-open-valuation]').forEach(b=>b.addEventListener('click',()=>dialog?.showModal()));$$('[data-close-valuation]').forEach(b=>b.addEventListener('click',()=>dialog?.close()));
  dialog?.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
  const f=$('#sellForm');f?.addEventListener('submit',e=>{e.preventDefault();const d=new FormData(f);const msg=`Hola, quiero valorar mi coche.\nMarca y modelo: ${d.get('model')}\nAño: ${d.get('year')}\nKilómetros: ${d.get('km')}\nTeléfono: ${d.get('phone')}\nDetalles: ${d.get('message')||'-'}`;window.open(wa(msg),'_blank','noopener');});
}
function reveal(){
  const items=$$('[data-reveal]');if(!items.length)return;if(matchMedia('(prefers-reduced-motion: reduce)').matches){items.forEach(el=>el.classList.add('is-visible'));return;}
  const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target);}}),{threshold:.12});items.forEach(el=>io.observe(el));
}
header();whatsapp();featured();quick();valuation();requestAnimationFrame(reveal);
