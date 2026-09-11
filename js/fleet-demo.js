import {vehicles as examples} from './data.js';

// Public demonstration values, never credentials for Supabase or the real fleet.
export const DEMO_EMAIL='demo@gjlarry.test';
export const DEMO_PASSWORD='LarryDemo2026!';

export function createDemoFleet(){
 let rows=null;
 const uploads=new Set();
 const requireSession=()=>{if(!rows)throw new Error('Entra en la demo para continuar.');};
 function clear(){for(const url of uploads)URL.revokeObjectURL(url);uploads.clear();rows=null;}
 return {
  async login(email,password){
   clear();
   if(email.toLowerCase()!==DEMO_EMAIL||password!==DEMO_PASSWORD)throw new Error('Usa el correo y la contraseña de prueba que aparecen debajo.');
   rows=structuredClone(examples).map((v,i)=>({...v,id:`demo-${i+1}`,status:'published',version:1}));
   return {email:DEMO_EMAIL};
  },
  async logout(){clear();},
  async listFleet(){requireSession();return structuredClone(rows);},
  async resolvePhotos(vehicles){
   requireSession();
   return structuredClone(vehicles).map(v=>({...v,gallery:v.gallery.map(p=>({...p,src:p.path||p.src})),image:v.gallery[0]?.path||v.gallery[0]?.src||'assets/image-unavailable.svg'}));
  },
  async saveVehicle(vehicle,old){
   requireSession();
   if(!vehicle.brand?.trim()||!vehicle.model?.trim())throw new Error('Completa la marca y el modelo.');
   if(!['draft','published','reserved','sold','archived'].includes(vehicle.status))throw new Error('Elige un estado válido.');
   if(vehicle.gallery.length>20||(['published','reserved'].includes(vehicle.status)&&!vehicle.gallery.length))throw new Error('Los vehículos en catálogo necesitan entre 1 y 20 fotos.');
   for(const photo of vehicle.gallery){const path=photo.path||photo.src;if(!uploads.has(path)&&!/^assets\/images\/[a-z0-9-]+\.webp$/.test(path))throw new Error('Esta fotografía no pertenece a la demo.');}
   const previous=old?rows.find(v=>v.id===old.id):null;
   if(old&&(!previous||previous.version!==old.version))throw new Error('La ficha ha cambiado. Actualiza la lista y vuelve a editar.');
   const saved=structuredClone({...vehicle,id:previous?.id||crypto.randomUUID(),version:(previous?.version||0)+1});
   rows=previous?rows.map(v=>v.id===previous.id?saved:v):[saved,...rows];
   return structuredClone(saved);
  },
  async uploadPhoto(blob){
   requireSession();
   if(blob.type!=='image/jpeg'||blob.size>8*1024*1024)throw new Error('La fotografía no tiene un formato o tamaño válido.');
   const url=URL.createObjectURL(blob);uploads.add(url);return url;
  },
  async removeUnusedPhoto(path){
   requireSession();
   if(uploads.has(path)&&!rows.some(v=>v.gallery.some(p=>(p.path||p.src)===path))){URL.revokeObjectURL(path);uploads.delete(path);}
  }
 };
}
