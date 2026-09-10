import {vehicles,euro,km} from './data.js';
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels={published:'En catálogo',draft:'Borrador',reserved:'Reservado',sold:'Vendido'};
let fleet=structuredClone(vehicles).map(v=>({...v,id:v.slug,status:'published'}));
let editing=null,photos=[],pendingDelete=null,dirty=false,uploadRun=0;
const urls=new Set();
const form=$('#vehicleForm'),editor=$('#vehicleEditor'),deletion=$('#deleteDialog');
function render(){
 const q=$('#fleetSearch').value.trim().toLocaleLowerCase('es'),status=$('#fleetStatus').value;
 const list=fleet.filter(v=>(!q||`${v.brand} ${v.model}`.toLocaleLowerCase('es').includes(q))&&(!status||v.status===status));
 $('#fleetSummary').innerHTML=Object.entries(labels).map(([key,label])=>`<div><span>${label}</span><strong>${fleet.filter(v=>v.status===key).length}</strong></div>`).join('');
 $('#fleetCount').textContent=`${list.length} ${list.length===1?'vehículo':'vehículos'}`;
 $('#fleetList').innerHTML=list.length?list.map(v=>`<article class="fleet-row">${v.gallery.length?`<img src="${esc(v.gallery[0].src)}" alt="${esc(v.brand+' '+v.model)}" width="144" height="108">`:'<div class="fleet-no-photo">Sin foto</div>'}<div class="fleet-name"><span class="fleet-badge ${v.status}">${labels[v.status]}</span><h2>${esc(v.brand)} ${esc(v.model)}</h2><p>${[v.year,v.km===null?null:km(v.km),v.fuel].filter(x=>x!==null&&x!=='').map(esc).join(' · ')||'Datos pendientes'}</p></div><div class="fleet-price">${euro(v.price)}</div><div class="fleet-actions"><button data-edit="${esc(v.id)}" aria-label="Editar ${esc(v.brand+' '+v.model)}">Editar ↗</button><button data-delete="${esc(v.id)}" aria-label="Eliminar ${esc(v.brand+' '+v.model)}">Eliminar</button></div></article>`).join(''):'<div class="fleet-empty"><h2>No hay vehículos en esta selección.</h2><p>Cambia la búsqueda o añade una nueva unidad.</p></div>';
}
function renderPhotos(){
 $('#editorPhotos').innerHTML=photos.map((p,i)=>`<div><img src="${esc(p.src)}" alt="Foto ${i+1}" width="140" height="100"><span>${i===0?'Portada':`Foto ${i+1}`}</span><div><button type="button" data-up="${i}" ${i===0?'disabled':''} aria-label="Mover foto ${i+1} hacia el principio">←</button><button type="button" data-down="${i}" ${i===photos.length-1?'disabled':''} aria-label="Mover foto ${i+1} hacia el final">→</button><button type="button" data-remove="${i}" aria-label="Retirar foto ${i+1}">×</button></div></div>`).join('');
}
function openEditor(id=null){
 uploadRun++;form.querySelector('[type=submit]').disabled=false;editing=id;form.reset();$('#photoFeedback').textContent='';$('#photoUpload').value='';
 const v=id?fleet.find(v=>v.id===id):null;
 $('#editorTitle').textContent=v?'Editar vehículo':'Añadir vehículo';
 for(const key of ['brand','model','price','year','km','fuel','gear','desc','status'])form.elements[key].value=v?.[key]??(key==='status'?'draft':'');
 form.elements.equipment.value=v?.equipment?.join('\n')||'';
 photos=structuredClone(v?.gallery||[]);dirty=false;renderPhotos();editor.showModal();
}
function closeEditor(){if(dirty&&!confirm('¿Descartar los cambios sin guardar de esta ficha?'))return;editor.close();dirty=false;}
$('#addVehicle').addEventListener('click',()=>openEditor());
$('#closeEditor').addEventListener('click',closeEditor);$('#cancelEditor').addEventListener('click',closeEditor);
editor.addEventListener('cancel',e=>{e.preventDefault();closeEditor();});
form.addEventListener('input',()=>{dirty=true;});
$('#fleetSearch').addEventListener('input',render);$('#fleetStatus').addEventListener('change',render);
$('#fleetList').addEventListener('click',e=>{
 const edit=e.target.closest('[data-edit]'),remove=e.target.closest('[data-delete]');
 if(edit)openEditor(edit.dataset.edit);
 if(remove){pendingDelete=remove.dataset.delete;const v=fleet.find(v=>v.id===pendingDelete);$('#deleteName').textContent=`${v.brand} ${v.model}`;deletion.showModal();}
});
$('#cancelDelete').addEventListener('click',()=>deletion.close());
$('#confirmDelete').addEventListener('click',()=>{fleet=fleet.filter(v=>v.id!==pendingDelete);pendingDelete=null;deletion.close();render();$('#panelFeedback').textContent='Vehículo eliminado de la vista previa.';});
$('#editorPhotos').addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.remove!==undefined)photos.splice(Number(b.dataset.remove),1);
 else if(b.dataset.up!==undefined){const i=Number(b.dataset.up);if(i>0)[photos[i-1],photos[i]]=[photos[i],photos[i-1]];}
 else if(b.dataset.down!==undefined){const i=Number(b.dataset.down);if(i<photos.length-1)[photos[i+1],photos[i]]=[photos[i],photos[i+1]];}
 dirty=true;renderPhotos();
});
$('#photoUpload').addEventListener('change',async e=>{
 const run=++uploadRun;const submit=form.querySelector('[type=submit]');submit.disabled=true;
 const errors=[];
 for(const file of e.target.files){
  if(photos.length>=20){errors.push('Máximo 20 fotos por vehículo.');break;}
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>8*1024*1024){errors.push(`${file.name}: formato o tamaño no admitido.`);continue;}
  const url=URL.createObjectURL(file);const img=new Image();img.src=url;
  try{await img.decode();if(run!==uploadRun){URL.revokeObjectURL(url);return;}if(img.naturalWidth*img.naturalHeight>40000000)throw Error('resolution');urls.add(url);photos.push({src:url,alt:'Fotografía del vehículo'});dirty=true;}catch{URL.revokeObjectURL(url);errors.push(`${file.name}: imagen no válida o demasiado grande.`);}
 }
 if(run!==uploadRun)return;submit.disabled=false;
 e.target.value='';$('#photoFeedback').textContent=errors.join(' ');renderPhotos();
});
form.addEventListener('submit',e=>{
 e.preventDefault();if(!form.reportValidity())return;
 const d=new FormData(form),brand=d.get('brand').trim(),model=d.get('model').trim();
 if(!brand||!model){$('#photoFeedback').textContent='Completa la marca y el modelo.';return;}
 if(d.get('status')==='published'&&!photos.length){$('#photoFeedback').textContent='Añade al menos una fotografía para marcarlo como En catálogo.';return;}
 const old=fleet.find(v=>v.id===editing);const number=key=>d.get(key)===''?null:Number(d.get(key));
 const v={...old,id:editing||crypto.randomUUID(),brand,model,price:number('price'),year:number('year'),km:number('km'),fuel:d.get('fuel')||null,gear:d.get('gear')||null,desc:d.get('desc').trim(),equipment:d.get('equipment').split('\n').map(x=>x.trim()).filter(Boolean),status:d.get('status'),gallery:structuredClone(photos)};
 if(old)fleet=fleet.map(item=>item.id===editing?v:item);else fleet.unshift(v);
 dirty=false;editor.close();render();$('#panelFeedback').textContent='Ficha guardada en la vista previa. La web pública no ha cambiado.';
});
addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
addEventListener('pagehide',()=>{for(const url of urls)URL.revokeObjectURL(url);});
render();
