import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {vehicles,business} from '../js/data.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const pages=['index.html','vehiculos.html','vehiculo.html'];
let failures=[];

for(const page of pages){
  const file=path.join(root,page);
  if(!fs.existsSync(file)){failures.push(`Missing ${page}`);continue;}
  const html=fs.readFileSync(file,'utf8');
  if(!/<meta[^>]+name=["']viewport["']/i.test(html)) failures.push(`${page}: missing viewport meta`);
  if(!/<title>[^<]+<\/title>/i.test(html)) failures.push(`${page}: missing title`);
  for(const match of html.matchAll(/(?:href|src)=["']([^"']+)["']/gi)){
    const ref=match[1];
    if(!ref||ref.startsWith('#')||/^(https?:|tel:|mailto:|data:|javascript:)/i.test(ref)) continue;
    const clean=ref.split(/[?#]/)[0];
    if(!clean) continue;
    const target=path.resolve(root,clean);
    if(!fs.existsSync(target)) failures.push(`${page}: broken local reference ${ref}`);
  }
}

const slugs=new Set();
for(const v of vehicles){
  if(!v.slug||slugs.has(v.slug)) failures.push(`Invalid or duplicate vehicle slug: ${v.slug}`);
  slugs.add(v.slug);
  if(!Number.isFinite(v.price)||v.price<=0) failures.push(`${v.slug}: invalid price`);
  if(!Number.isFinite(v.km)||v.km<0) failures.push(`${v.slug}: invalid mileage`);
  if(!v.sourceUrl?.startsWith('https://')) failures.push(`${v.slug}: missing source URL`);
}
if(!/^34\d{9}$/.test(business.phoneRaw)) failures.push('Invalid WhatsApp phoneRaw');

if(failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log(`Quality check passed: ${pages.length} pages, ${vehicles.length} vehicle(s).`);
