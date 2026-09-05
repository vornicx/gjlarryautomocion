import {vehicles} from './data.js';
import {vehicleCard,fillSelect} from './app.js';
const $=s=>document.querySelector(s);
const form=$('#catalogFilters'),grid=$('#allVehicles'),count=$('#resultCount'),empty=$('#noResults');
const brand=$('#catalogBrand'),model=$('#catalogModel'),fuel=$('#catalogFuel');
fillSelect(brand,[...new Set(vehicles.map(v=>v.brand))],'Todas las marcas');
fillSelect(fuel,[...new Set(vehicles.map(v=>v.fuel).filter(Boolean))],'Todos');
const updateModels=()=>fillSelect(model,[...new Set(vehicles.filter(v=>!brand.value||v.brand===brand.value).map(v=>v.model))],'Todos los modelos');
function readQuery() {
  form.reset();const qs=new URLSearchParams(location.search);brand.value=qs.get('brand')||'';if(brand.selectedIndex<0)brand.value='';updateModels();
  for(const key of ['model','fuel','maxPrice','sort']) {const el=form.elements.namedItem(key),value=qs.get(key);if(value&&[...el.options].some(o=>o.value===value))el.value=value;}
}
function compareKnown(a,b,key,direction=1) {
  if(a[key]===null)return b[key]===null?0:1;
  if(b[key]===null)return -1;
  return direction*(a[key]-b[key]);
}
function render(sync=false) {
  const d=new FormData(form),b=d.get('brand'),m=d.get('model'),f=d.get('fuel'),max=d.get('maxPrice')?Number(d.get('maxPrice')):null,sort=d.get('sort');
  let list=vehicles.filter(v=>(!b||v.brand===b)&&(!m||v.model===m)&&(!f||v.fuel===f)&&(max===null||(v.price!==null&&v.price<=max)));
  if(sort==='price-asc')list.sort((a,b)=>compareKnown(a,b,'price'));else if(sort==='price-desc')list.sort((a,b)=>compareKnown(a,b,'price',-1));else if(sort==='km-asc')list.sort((a,b)=>compareKnown(a,b,'km'));
  grid.innerHTML=list.map(v=>vehicleCard(v)).join('');count.textContent=`${list.length} ${list.length===1?'vehículo':'vehículos'}`;empty.hidden=!!list.length;grid.hidden=!list.length;$('#priceFilterNote').hidden=max===null;
  if(sync){const q=new URLSearchParams();for(const [key,value] of d)if(value&&!(key==='sort'&&value==='recent'))q.set(key,value);const next=location.pathname+(q.size?'?'+q:'');if(next!==location.pathname+location.search)history.pushState(null,'',next);}
}
form.addEventListener('submit',e=>e.preventDefault());
form.addEventListener('change',e=>{if(e.target===brand)updateModels();render(true);});
function reset(){form.reset();updateModels();render(true);}
$('#filterReset').addEventListener('click',reset);$('#emptyReset').addEventListener('click',()=>{reset();brand.focus();});
addEventListener('popstate',()=>{readQuery();render();});readQuery();render();
