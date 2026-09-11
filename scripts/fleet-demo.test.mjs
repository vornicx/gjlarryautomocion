import test from 'node:test';
import assert from 'node:assert/strict';
import * as panel from '../js/panel-data.js';
import {vehicles} from '../js/data.js';

test('public demo supports editing, photos and retirement without any API request',async()=>{
 const originalFetch=globalThis.fetch;
 let requests=0;
 globalThis.fetch=async()=>{requests++;throw new Error('Demo must not use the network');};
 try{
  await assert.rejects(panel.login(panel.DEMO_EMAIL,'wrong'),/prueba/);
  assert.throws(()=>panel.listFleet(),/sesión/);
  await panel.login(panel.DEMO_EMAIL,panel.DEMO_PASSWORD);
  assert.equal(panel.isDemo(),true);
  const original=await panel.listFleet();
  const before=structuredClone(vehicles);
  const added=await panel.saveVehicle({...original[0],slug:'demo-new',brand:'Prueba',model:'Unidad demo',status:'draft'},null);
  assert.equal((await panel.listFleet()).length,original.length+1);
  const photo=await panel.uploadPhoto(new Blob(['test-image'],{type:'image/jpeg'}));
  const edited=await panel.saveVehicle({...added,model:'Unidad editada',gallery:[{src:photo,path:photo,alt:'Prueba'}]},added);
  assert.equal((await panel.resolvePhotos([edited]))[0].gallery[0].src,photo);
  const retired=await panel.saveVehicle({...edited,status:'archived'},edited);
  assert.equal(retired.status,'archived');
  await assert.rejects(panel.saveVehicle({...edited,status:'published'},edited),/cambiado/);
  assert.deepEqual(vehicles,before);
  await panel.logout();
  assert.throws(()=>panel.listFleet(),/sesión/);
  await panel.login(panel.DEMO_EMAIL,panel.DEMO_PASSWORD);
  assert.deepEqual(await panel.listFleet(),original);
  assert.equal(requests,0);
 }finally{await panel.logout();globalThis.fetch=originalFetch;}
});

test('a normal account still requires server authentication',async()=>{
 const originalFetch=globalThis.fetch;
 let requests=0;
 globalThis.fetch=async url=>{
  requests++;assert.match(url,/\/auth\/v1\/token/);
  return new Response(JSON.stringify({error_code:'invalid_credentials'}),{status:400});
 };
 try{
  await assert.rejects(panel.login('unauthorized@example.test','not-a-real-password'),/no son correctos/);
  assert.equal(panel.isDemo(),false);
  assert.throws(()=>panel.listFleet(),/sesión/);
  assert.equal(requests,1);
 }finally{await panel.logout();globalThis.fetch=originalFetch;}
});
