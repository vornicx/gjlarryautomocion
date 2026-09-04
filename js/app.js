import {vehicles, business, euro, km} from './data.js';
const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
const wa=(text='Hola, me gustaría recibir información de GJ Larry Automoción.')=>`https://wa.me/${business.phoneRaw}?text=${encodeURIComponent(text)}`;

function header(){
  const h=$('.topbar');
  if(h){const on=()=>h.classList.toggle('scrolled',scrollY>18);on();addEventListener('scroll',on,{passive:true});}
  const b=$('.menu'),p=$('.mobilepanel');
  b?.addEventListener('click',()=>p.classList.toggle('open'));
  $$('.mobilepanel a').forEach(a=>a.addEventListener('click',()=>p?.classList.remove('open')));
  $$('[data-wa]').forEach(a=>a.href=wa(a.dataset.wa||undefined));
}

function card(v){
  return `<article class="vehicle-card">
    <a class="vehicle-image" href="vehiculo.html?slug=${v.slug}">
      <img loading="lazy" src="${v.image}" alt="Imagen de apoyo para ${v.brand} ${v.model}">
      <span class="stock-tag">EN STOCK</span>
    </a>
    <div class="vehicle-body">
      <div class="vehicle-title"><div><h3>${v.brand} ${v.model}</h3><div class="sub">${v.year} · ${v.gear} · ${v.drive}</div></div><div class="vehicle-price">${euro(v.price)}</div></div>
      <div class="specrow"><span>${km(v.km)}</span><span>${v.fuel}</span><span>${v.power}</span></div>
      <div class="card-actions"><a class="textlink" href="vehiculo.html?slug=${v.slug}">Ver ficha</a><a class="source-link" href="${v.sourceUrl}" target="_blank" rel="noopener">Fotos reales ↗</a></div>
    </div>
  </article>`;
}

function featured(){const g=$('#featuredGrid');if(g)g.innerHTML=vehicles.map(card).join('');}
function quick(){
  const f=$('#quickSearch');
  f?.addEventListener('submit',e=>{e.preventDefault();location.href='vehiculos.html';});
}
function sell(){
  const f=$('#sellForm');
  f?.addEventListener('submit',e=>{
    e.preventDefault();const d=new FormData(f);
    const msg=`Hola, quiero valorar mi coche.\nMarca y modelo: ${d.get('model')}\nAño: ${d.get('year')}\nKilómetros: ${d.get('km')}\nTeléfono: ${d.get('phone')}\nDetalles: ${d.get('message')||'-'}`;
    window.open(wa(msg),'_blank','noopener');
  });
}
header();featured();quick();sell();
