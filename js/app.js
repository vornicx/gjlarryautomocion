import {business,euro,km} from './data.js';
const $ = (selector, parent=document) => parent.querySelector(selector);
const $$ = (selector, parent=document) => [...parent.querySelectorAll(selector)];
export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const wa = (text='Hola, me gustaría recibir información de GJ Larry Automoción.') => `https://wa.me/${business.phoneRaw}?text=${encodeURIComponent(text)}`;
export const vehicleName = v => `${v.brand} ${v.shortModel || v.model}`;
export const vehicleUrl = v => {
  const query=new URLSearchParams({slug:v.slug});
  if (/\/vehiculos(?:\.html)?$/.test(location.pathname) && location.search) query.set('filters',location.search.slice(1));
  return `vehiculo.html?${query}`;
};
export function vehicleCard(v, variant='catalog') {
  const name=escapeHTML(vehicleName(v));
  const heading=variant==='home'?'h3':'h2';
  const summary=[v.year,v.km===null?null:km(v.km),v.gear].filter(Boolean).join(' · ')||v.cardDescription;
  return `<article class="vehicle-card"><a class="card-image" href="${vehicleUrl(v)}" aria-label="Ver ${name}"><img src="${v.image}" srcset="${v.image.replace('.webp','-sm.webp')} 640w, ${v.image} ${v.imageWidth || 1440}w" sizes="(max-width:760px) 100vw, (max-width:900px) 50vw, 33vw" width="${v.imageWidth||1440}" height="${v.imageHeight||1080}" loading="lazy" decoding="async" alt="${name} en GJ Larry Automoción"><span class="card-photo-count"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h5l2-2h4l2 2h5v14H3z"/><circle cx="12" cy="13" r="4"/></svg>${v.gallery.length} fotos</span></a><div class="card-body"><div class="card-kicker"><span>${escapeHTML(v.body)}</span><span>${escapeHTML(v.color)}</span></div><${heading}><a href="${vehicleUrl(v)}">${name}</a></${heading}><p class="card-description">${escapeHTML(summary)}</p><div class="card-bottom"><span class="card-price${v.price===null?' unknown':''}">${v.price===null?'Consultar precio':euro(v.price)}</span><a href="${vehicleUrl(v)}" aria-label="Ver ficha de ${name}">↗</a></div></div></article>`;
}
export function fillSelect(select, values, placeholder) {
  if (!select) return;
  const previous=select.value;
  select.replaceChildren(new Option(placeholder,''), ...values.filter(Boolean).map(value=>new Option(value,value)));
  if (values.includes(previous)) select.value=previous;
}
function header() {
  const menu=$('.menu'),panel=$('#mobileMenu');
  if(!menu||!panel)return;
  const close = (focus=false) => { panel.hidden=true;menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Abrir menú');if(focus)menu.focus(); };
  const positionPanel=()=>{panel.style.setProperty('--nav-bottom',`${Math.round($('.topbar').getBoundingClientRect().bottom)}px`);};
  addEventListener('scroll',()=>{if(!panel.hidden)positionPanel();},{passive:true});
  addEventListener('resize',()=>{if(!panel.hidden)positionPanel();},{passive:true});
  menu.addEventListener('click',()=>{positionPanel();const open=menu.getAttribute('aria-expanded')==='true';panel.hidden=open;menu.setAttribute('aria-expanded',String(!open));menu.setAttribute('aria-label',open?'Abrir menú':'Cerrar menú');});
  $$('#mobileMenu a').forEach(a=>a.addEventListener('click',()=>close()));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)close(true);});
  panel.addEventListener('focusout',()=>queueMicrotask(()=>{if(!panel.contains(document.activeElement)&&document.activeElement!==menu)close();}));
  document.addEventListener('pointerdown',e=>{if(!panel.hidden&&!panel.contains(e.target)&&!menu.contains(e.target))close();});
  const mq=matchMedia('(min-width:1101px)');mq.addEventListener('change',e=>{if(e.matches)close();});
  const current=location.pathname.split('/').pop().replace(/\.html$/,'')||'index';
  $$('nav a').forEach(a=>{if(a.getAttribute('href')===`${current}.html`)a.setAttribute('aria-current','page');});
}
function quickSearch(vehicles) {
  const form=$('#quickSearch');if(!form)return;
  const brand=$('#brandFilter'),model=$('#modelFilter');
  fillSelect(brand,[...new Set(vehicles.map(v=>v.brand))],'Todas las marcas');
  const updateModels=()=>fillSelect(model,[...new Set(vehicles.filter(v=>!brand.value||v.brand===brand.value).map(v=>v.model))],'Todos los modelos');
  updateModels();brand.addEventListener('change',updateModels);
  form.addEventListener('submit',e=>{e.preventDefault();const q=new URLSearchParams();for(const [k,v] of new FormData(form))if(v)q.set(k,v);location.assign(`vehiculos.html${q.size?'?'+q:''}`);});
}
export function valuationMessage(data) {
  return `Hola, quiero valorar mi coche.\nMarca y modelo: ${data.get('model').trim()}\nAño: ${data.get('year')}\nKilómetros: ${data.get('km')}\nTeléfono: ${data.get('phone').trim()}\nDetalles: ${data.get('message')?.trim()||'-'}`;
}
function valuation() {
  const dialog=$('#valuationDialog');if(!dialog)return;
  const form=$('#sellForm');form.elements.year.max=String(new Date().getFullYear()+1);
  $$('[data-open-valuation]').forEach(b=>b.addEventListener('click',()=>dialog.showModal()));
  $$('[data-close-valuation]').forEach(b=>b.addEventListener('click',()=>dialog.close()));
  dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))dialog.close();});
  function validate() {
    const {model,phone}=form.elements;
    model.setCustomValidity(model.value.trim().length<2?'Indica la marca y el modelo de tu coche.':'');
    const digits=phone.value.replace(/\D/g,'');
    phone.setCustomValidity(digits.length<7||digits.length>15?'Introduce un teléfono válido con entre 7 y 15 dígitos.':'');
  }
  form.addEventListener('input',validate);
  form.addEventListener('submit',e=>{e.preventDefault();validate();if(!form.reportValidity())return;location.assign(wa(valuationMessage(new FormData(form))));});
}
function reveal() {
  if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;
  const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target);}}),{threshold:.1});
  $$('[data-reveal]').forEach(el=>{if(el.getBoundingClientRect().top>innerHeight){el.classList.add('reveal-ready');io.observe(el);}});
}
header();valuation();
$$('[data-wa]').forEach(a=>a.href=wa(a.dataset.wa||undefined));
reveal();

// Navigation and service pages must never wait for the inventory API.
async function homeInventory() {
 const {vehicles}=await import('./catalog-data.js');
 quickSearch(vehicles);
 const spotlight=vehicles.find(v=>v.slug==='bmw-x3-xdrive-30d-m-sport-2024')||vehicles[0];
 const featured=$('#featuredGrid');
 if(featured)featured.innerHTML=vehicles.filter(v=>v.id!==spotlight?.id).slice(0,3).map(v=>vehicleCard(v,'home')).join('');
 const showcase=$('.hero-showcase');
 if(showcase){
  const v=spotlight;
  if(!v)showcase.hidden=true;
  else {
   const photo=showcase.querySelector('.showcase-photo');photo.href=vehicleUrl(v);photo.setAttribute('aria-label',`Descubrir ${vehicleName(v)}`);
   const img=photo.querySelector('img');img.src=v.image;img.alt=vehicleName(v)+' en GJ Larry';
   showcase.querySelector('h2').textContent=v.brand;
   showcase.querySelector('.showcase-version').textContent=v.model;
   const specs=showcase.querySelectorAll('dd');specs[0].textContent=v.year||'Consultar';specs[1].textContent=v.km===null?'Consultar':km(v.km);specs[2].textContent=[v.fuel,v.power].filter(Boolean).join(' · ')||'Consultar';
   showcase.querySelector('.showcase-bottom strong').textContent=euro(v.price);
   showcase.querySelector('.showcase-bottom a').href=vehicleUrl(v);
  }
 }

}
if($('#featuredGrid')||$('.hero-showcase'))homeInventory();
