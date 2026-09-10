import test from 'node:test';
import assert from 'node:assert/strict';
import {resolvePhotos,saveVehicle,request} from '../js/fleet-api.js';

const originalFetch=globalThis.fetch;
const fixture={slug:'test-car-stable-id',brand:'Test',model:'Car',price:null,year:null,km:null,fuel:null,gear:null,body:null,color:null,power:null,drive:null,desc:'Ficha',equipment:[],status:'draft',gallery:[{src:'assets/images/bmw-x3-01.webp',alt:'Foto'}]};
const response=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});

test('failed signing preserves photo paths and order for future saves',async()=>{
 globalThis.fetch=async()=>{throw new TypeError('Network offline');};
 try{
  const path='11111111-1111-4111-8111-111111111111/22222222-2222-4222-8222-222222222222.jpg';
  const [row]=await resolvePhotos([{...fixture,gallery:[{src:path,alt:'Original'},{src:fixture.gallery[0].src}]}]);
  assert.equal(row.gallery.length,2);assert.equal(row.gallery[0].path,path);assert.equal(row.gallery[0].unavailable,true);assert.ok(row.image);
 }finally{globalThis.fetch=originalFetch;}
});
test('retry after an accepted creation returns that same record without duplicating',async()=>{
 let stored,insertions=0;
 globalThis.fetch=async(_url,options)=>{
  if(options.method==='POST'){
   const payload=JSON.parse(options.body);
   if(stored){assert.equal(payload.slug,stored.slug);return response({code:'23505'},409);}
   insertions++;stored={...payload,id:'existing-id',version:1,gallery:[{alt:'Foto',src:'assets/images/bmw-x3-01.webp'}]};
   throw new TypeError('Lost response after commit');
  }
  return response([stored]);
 };
 try{
  await assert.rejects(saveVehicle(fixture),/No se recibió respuesta/);
  const result=await saveVehicle(fixture);assert.equal(result.id,'existing-id');assert.equal(insertions,1);
  await assert.rejects(saveVehicle({...fixture,model:'Changed after timeout'}),/ya se creó/);
 }finally{globalThis.fetch=originalFetch;}
});
test('stale edit never falls back to an unconditional update',async()=>{
 let calls=0;
 globalThis.fetch=async(url,options)=>{calls++;assert.ok(url.endsWith('?id=eq.car-id&version=eq.3'));assert.equal(options.method,'PATCH');return response([]);};
 try{await assert.rejects(saveVehicle(fixture,{id:'car-id',version:3}),/otra sesión/);assert.equal(calls,1);}finally{globalThis.fetch=originalFetch;}
});
test('authentication and rate limit messages do not expose server details',async()=>{
 try{
  globalThis.fetch=async()=>response({error_code:'invalid_credentials',message:'Internal detail'},400);
  await assert.rejects(request('/auth/v1/token'),/correo o la contraseña/);
  globalThis.fetch=async()=>response({},429);
  await assert.rejects(request('/auth/v1/token'),/Demasiados intentos/);
 }finally{globalThis.fetch=originalFetch;}
});
