// Publishable key only. Every read/write is authorized by database RLS.
const base='https://sqniuavyijyrfigwyipw.supabase.co';
const key='sb_publishable_IzoM_IAv2uoc0bI8deuFbQ_IAuX347V';
const stableJSON=value=>JSON.stringify(value,(_key,item)=>item&&typeof item==='object'&&!Array.isArray(item)?Object.fromEntries(Object.entries(item).sort(([a],[b])=>a.localeCompare(b))):item);
let session=null,refreshing=null;
export async function request(path,{method='GET',body,headers={}}={}){
 if(session&&!path.startsWith('/auth/')&&session.expires_at*1000<Date.now()+60000){
  refreshing ||= request('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:session.refresh_token}}).then(value=>{session=value;}).finally(()=>{refreshing=null;});
  await refreshing;
 }
 let response;
 try{response=await fetch(base+path,{method,headers:{apikey:key,...(session?{Authorization:`Bearer ${session.access_token}`} : {}),...(body instanceof Blob?{}:{'Content-Type':'application/json'}),...headers},body:body instanceof Blob?body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(25000)});}
 catch{throw new Error('No se recibió respuesta. Comprueba la conexión y vuelve a intentarlo; tus cambios siguen en el editor.');}
 const data=await response.json().catch(()=>null);
 if(!response.ok){
  let message='No se pudo completar la operación. Inténtalo de nuevo.';
  if(response.status===401)message='La sesión ha caducado. Vuelve a entrar.';
  if(response.status===403)message='No tienes permiso para realizar esta acción.';
  if(response.status===429)message='Demasiados intentos. Espera unos minutos antes de volver a probar.';
  if(data?.code==='23514')message='Revisa los datos de la ficha. Los coches en catálogo o reservados necesitan al menos una foto.';
  if(data?.error_code==='invalid_credentials')message='El correo o la contraseña no son correctos.';
  if(data?.error_code==='email_not_confirmed')message='Confirma tu correo desde la invitación antes de entrar.';
  const error=new Error(message);error.status=response.status;error.code=data?.code||data?.error_code;throw error;
 }
 return data;
}
export async function login(email,password){
 session=null;
 const result=await request('/auth/v1/token?grant_type=password',{method:'POST',body:{email,password}});
 session=result;
 try { const allowed=await request('/rest/v1/rpc/fleet_operator_access',{method:'POST',body:{}});if(!allowed)throw new Error('Tu cuenta no tiene acceso a la gestión de GJ Larry.'); }
 catch(error){await logout().catch(()=>{});throw error;}
 return result.user;
}
export async function logout(){try{if(session)await request('/auth/v1/logout',{method:'POST'});}finally{session=null;}}
export async function verifyInvitation(tokenHash){
 session=null;
 try{
  session=await request('/auth/v1/verify',{method:'POST',body:{token_hash:tokenHash,type:'invite'}});
  if(!session?.access_token)throw new Error('No se pudo validar la invitación.');
  if(!await request('/rest/v1/rpc/fleet_operator_access',{method:'POST',body:{}}))throw new Error('Esta cuenta aún no tiene permisos de gestión.');
  return session.user;
 }catch(error){await logout().catch(()=>{});throw error;}
}
export async function setInitialPassword(password){
 if(!session)throw new Error('Vuelve a abrir tu invitación para elegir una contraseña.');
 if(password.length<12)throw new Error('Utiliza al menos 12 caracteres.');
 await request('/auth/v1/user',{method:'PUT',body:{password}});
 await logout().catch(()=>{});
}
export async function listFleet(){return request('/rest/v1/fleet_vehicles?select=*&order=created_at.desc,id.asc');}
export async function resolvePhotos(rows){
 const paths=[...new Set(rows.flatMap(v=>v.gallery.map(p=>p.src)).filter(p=>!p.startsWith('assets/')))];
 const signed=paths.length?await request('/storage/v1/object/sign/fleet',{method:'POST',body:{paths,expiresIn:3600}}).catch(()=>[]):[];
 const urls=new Map(signed.map(p=>[p.path,p.signedURL?base+'/storage/v1'+p.signedURL:null]));
 return rows.map(v=>{
  const gallery=v.gallery.map(p=>({...p,path:p.src,unavailable:!p.src.startsWith('assets/')&&!urls.get(p.src),src:p.src.startsWith('assets/')?p.src:urls.get(p.src)||'assets/image-unavailable.svg'}));
  return {...v,desc:v.description,shortModel:v.model,gallery,image:gallery[0]?.src||'assets/image-unavailable.svg'};
 });
}
export async function saveVehicle(vehicle,old){
 const payload={brand:vehicle.brand,model:vehicle.model,price:vehicle.price,year:vehicle.year,km:vehicle.km,fuel:vehicle.fuel,gear:vehicle.gear,body:vehicle.body,color:vehicle.color,power:vehicle.power,drive:vehicle.drive,description:vehicle.desc,equipment:vehicle.equipment,status:vehicle.status,gallery:vehicle.gallery.map(p=>({src:p.path||p.src,alt:p.alt||''}))};
 if(!old){if(!vehicle.slug)throw new Error('Cierra y vuelve a abrir el formulario para añadir este vehículo.');payload.slug=vehicle.slug;}
 let result;
 try{result=await request('/rest/v1/fleet_vehicles'+(old?`?id=eq.${old.id}&version=eq.${old.version}`:''),{method:old?'PATCH':'POST',body:payload,headers:{Prefer:'return=representation'}});}
 catch(error){
  if(old||error.code!=='23505')throw error;
  const existing=await request('/rest/v1/fleet_vehicles?slug=eq.'+encodeURIComponent(payload.slug)+'&select=*');
  if(existing.length===1&&Object.entries(payload).every(([key,value])=>stableJSON(existing[0][key])===stableJSON(value)))return existing[0];
  throw new Error('Este vehículo ya se creó. Cierra el editor y actualiza la lista para continuar desde su ficha.');
 }
 if(!result.length)throw new Error('Esta ficha ha cambiado en otra sesión. Cierra el editor y actualiza la lista antes de volver a editar.');
 return result[0];
}
export async function uploadPhoto(blob){
 if(!session)throw new Error('Inicia sesión para subir fotografías.');
 const path=session.user.id+'/'+crypto.randomUUID()+'.jpg';
 await request('/storage/v1/object/fleet/'+path,{method:'POST',body:blob,headers:{'Content-Type':'image/jpeg'}});
 return path;
}
export async function removeUnusedPhoto(path){if(path&&!path.startsWith('assets/'))await request('/storage/v1/object/fleet',{method:'DELETE',body:{prefixes:[path]}});}
