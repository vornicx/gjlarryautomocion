import {listFleet,resolvePhotos} from './fleet-api.js';
export let vehicles=[];
try { vehicles=(await resolvePhotos(await listFleet())).map(v=>({...v,cardDescription:'Fotografías reales · Consulta los detalles'})); }
catch {
 const message=document.createElement('p');message.className='catalog-error';message.setAttribute('role','alert');message.textContent='No hemos podido cargar los vehículos. Recarga la página o contacta con nosotros para consultar disponibilidad.';
 document.querySelector('main')?.prepend(message);
}
