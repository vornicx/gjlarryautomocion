import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {vehicles,business} from '../js/data.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const pages=['index.html','vehiculos.html','vehiculo.html','404.html'];
const failures=[];
function local(ref,owner){
  if(!ref||ref.startsWith('#')||/^(https?:|tel:|mailto:|data:)/i.test(ref))return;
  const clean=ref.split(/[?#]/)[0];if(clean&&!fs.existsSync(path.resolve(root,clean)))failures.push(`${owner}: missing local asset ${ref}`);
}
for(const page of pages){
  const html=fs.readFileSync(path.join(root,page),'utf8');
  if(!/<meta[^>]+name=["']viewport["']/i.test(html))failures.push(`${page}: missing viewport`);
  if(!/<title>[^<]+<\/title>/i.test(html))failures.push(`${page}: missing title`);
  if(!html.includes('class="skip-link"'))failures.push(`${page}: missing skip link`);
  for(const match of html.matchAll(/(?:href|src)=["']([^"']+)["']/gi))local(match[1],page);
  for(const match of html.matchAll(/srcset="([^"]+)"/gi))for(const source of match[1].split(','))local(source.trim().split(/\s+/)[0],page);
  for(const match of html.matchAll(/href="([^"]*#[^"]+)"/gi)){
    const [target,id]=match[1].split('#');if(/^https?:/.test(target))continue;
    const targetHtml=fs.readFileSync(path.join(root,target||page),'utf8');
    if(!targetHtml.includes(`id="${id}"`))failures.push(`${page}: missing anchor ${match[1]}`);
  }
}
for(const match of fs.readFileSync(path.join(root,'styles.css'),'utf8').matchAll(/url\(['"]?([^'")]+)['"]?\)/g))local(match[1],'styles.css');
const slugs=new Set();
for(const v of vehicles){
  if(!/^[a-z0-9-]+$/.test(v.slug)||slugs.has(v.slug))failures.push(`Invalid or duplicate slug ${v.slug}`);slugs.add(v.slug);
  if(v.price!==null&&(!Number.isFinite(v.price)||v.price<=0))failures.push(`${v.slug}: invalid price`);
  if(v.km!==null&&(!Number.isFinite(v.km)||v.km<0))failures.push(`${v.slug}: invalid mileage`);
  if(!v.sourceUrl?.startsWith('https://'))failures.push(`${v.slug}: missing source`);
  if(!v.gallery?.length)failures.push(`${v.slug}: empty gallery`);
  local(v.image,v.slug);
  for(const photo of v.gallery){local(photo.src,v.slug);local(photo.src.replace('.webp','-sm.webp'),v.slug);if(!photo.alt)failures.push(`${v.slug}: missing photo description`);}
  if(v.price===null&&(v.year!==null||v.km!==null||v.fuel!==null))failures.push(`${v.slug}: unverified unit has inferred commercial data`);
}
if(!/^34\d{9}$/.test(business.phoneRaw))failures.push('Invalid WhatsApp number');
const font=fs.readFileSync(path.join(root,'assets/fonts/manrope.woff2'));if(font.subarray(0,4).toString()!=='wOF2')failures.push('Manrope asset is not WOFF2');
if(failures.length){console.error(failures.join('\n'));process.exit(1);}
console.log(`Quality check passed: ${pages.length} pages, ${vehicles.length} vehicles, ${vehicles.reduce((n,v)=>n+v.gallery.length,0)} gallery photographs.`);
