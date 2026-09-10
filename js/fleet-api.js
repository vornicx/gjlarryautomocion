// Publishable key only. Every read/write is authorized by database RLS.
const base='https://sqniuavyijyrfigwyipw.supabase.co';
const key='sb_publishable_IzoM_IAv2uoc0bI8deuFbQ_IAuX347V';
let session=null,refreshing=null;
export async function request(path,{method='GET',body,headers={}}={}){
 if(session&&!path.startsWith('/auth/')&&session.expires_at*1000<Date.now()+60000){
  refreshing ||= request('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:session.refresh_token}}).then(value=>{session=value;}).finally(()=>{refreshing=null;});
  await refreshing;
 }
 const response=await fetch(base+path,{method,headers:{apikey:key,...(session?{Authorization:`Bearer ${session.access_token}`} : {}),...(body instanceof Blob?{}:{'Content-Type':'application/json'}),...headers},body:body instanceof Blob?body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(25000)});
 const data=await response.json().catch(()=>null);
 if(!response.ok){const error=new Error(response.status===401?'La sesión ha caducado. Vuelve a entrar.':response.status===403?'No tienes permiso para realizar esta acción.':'No se pudo completar la operación. Comprueba la conexión e inténtalo de nuevo.');error.status=response.status;throw error;}
 return data;
}
export async function login(email,password){
 session=null;
 const result=await request('/auth/v1/token?grant_type=password',{method:'POST',body:{email,password}});
 session=result;
 try { const allowed=await request('/rest/v1/rpc/fleet_operator_access',{method:'POST',body:{}});if(!allowed)throw new Error('Tu cuenta no tiene acceso a la gestión de GJ Larry.'); }
 catch(error){await logout();throw error;}
 return result.user;
}
export async function logout(){try{if(session)await request('/auth/v1/logout',{method:'POST'});}finally{session=null;}}
export async function listFleet(){return request('/rest/v1/fleet_vehicles?select=*&order=created_at.desc');}
export async function resolvePhotos(rows){
 const paths=[...new Set(rows.flatMap(v=>v.gallery.map(p=>p.src)).filter(p=>!p.startsWith('assets/')))];
 const signed=paths.length?await request('/storage/v1/object/sign/fleet',{method:'POST',body:{paths,expiresIn:3600}}):[];
 const urls=new Map(signed.map(p=>[p.path,p.signedURL?base+'/storage/v1'+p.signedURL:null]));
 return rows.map(v=>({...v,desc:v.description,shortModel:v.model,gallery:v.gallery.map(p=>({...p,path:p.src,src:p.src.startsWith('assets/')?p.src:urls.get(p.src)})).filter(p=>p.src),image:v.gallery[0]?.src.startsWith('assets/')?v.gallery[0].src:urls.get(v.gallery[0]?.src)}));
}
export async function saveVehicle(vehicle,old){
 const payload={brand:vehicle.brand,model:vehicle.model,price:vehicle.price,year:vehicle.year,km:vehicle.km,fuel:vehicle.fuel,gear:vehicle.gear,body:vehicle.body,color:vehicle.color,power:vehicle.power,drive:vehicle.drive,description:vehicle.desc,equipment:vehicle.equipment,status:vehicle.status,gallery:vehicle.gallery.map(p=>({src:p.path||p.src,alt:p.alt||''}))};
 if(!old)payload.slug=(vehicle.brand+' '+vehicle.model).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,110)+'-'+crypto.randomUUID().slice(0,8);
 const result=await request('/rest/v1/fleet_vehicles'+(old?`?id=eq.${old.id}&version=eq.${old.version}`:''),{method:old?'PATCH':'POST',body:payload,headers:{Prefer:'return=representation'}});
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
