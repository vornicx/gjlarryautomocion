import * as live from './fleet-api.js';
import {createDemoFleet,DEMO_EMAIL,DEMO_PASSWORD} from './fleet-demo.js';
export {DEMO_EMAIL,DEMO_PASSWORD};
const demo=createDemoFleet();
let backend=null;
export const isDemo=()=>backend===demo;
export async function login(email,password){
 if(backend)await backend.logout();
 backend=null;
 const selected=email.trim().toLowerCase()===DEMO_EMAIL?demo:live;
 const user=await selected.login(email,password);
 backend=selected;
 return user;
}
function active(){if(!backend)throw new Error('Inicia sesión para continuar.');return backend;}
export async function logout(){try{if(backend)await backend.logout();}finally{backend=null;}}
export const listFleet=(...args)=>active().listFleet(...args);
export const resolvePhotos=(...args)=>active().resolvePhotos(...args);
export const saveVehicle=(...args)=>active().saveVehicle(...args);
export const uploadPhoto=(...args)=>active().uploadPhoto(...args);
export const removeUnusedPhoto=(...args)=>active().removeUnusedPhoto(...args);
