import {vehicles} from './data.js';
import {vehicleCard} from './app.js';
const $=(s,p=document)=>p.querySelector(s);
const form=$('#catalogFilters'),grid=$('#allVehicles'),count=$('#resultCount'),empty=$('#noResults');
const brand=$('#catalogBrand'),model=$('#catalogModel'),fuel=$('#catalogFuel');
const add=(select,values)=>values.forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;select.append(o);});
add(brand,[...new Set(vehicles.map(v=>v.brand))]);add(model,[...new Set(vehicles.map(v=>v.model))]);add(fuel,[...new Set(vehicles.map(v=>v.fuel))]);
const qs=new URLSearchParams(location.search);for(const [k,v] of qs){const el=form?.elements.namedItem(k);if(el&&typeof el.value!=='undefined')el.value=v;}
function render(){
  const d=new FormData(form),b=d.get('brand'),m=d.get('model'),f=d.get('fuel'),max=Number(d.get('maxPrice')||Infinity),sort=d.get('sort');
  let list=vehicles.filter(v=>(!b||v.brand===b)&&(!m||v.model===m)&&(!f||v.fuel===f)&&v.price<=max);
  if(sort==='price-asc')list.sort((a,b)=>a.price-b.price);else if(sort==='price-desc')list.sort((a,b)=>b.price-a.price);else if(sort==='km-asc')list.sort((a,b)=>a.km-b.km);else list.sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt));
  grid.innerHTML=list.map(v=>vehicleCard(v,'catalog')).join('');count.textContent=`${list.length} ${list.length===1?'vehículo':'vehículos'}`;empty.hidden=list.length>0;grid.hidden=!list.length;
}
form?.addEventListener('change',render);$('#filterReset')?.addEventListener('click',()=>{form.reset();history.replaceState({},'',location.pathname);render();});render();
