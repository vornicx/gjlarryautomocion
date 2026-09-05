import {cp, mkdir, rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import './check.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const out = resolve(root, 'dist');
await rm(out, {recursive:true, force:true});
await mkdir(out, {recursive:true});
for (const file of ['index.html', 'vehiculos.html', 'vehiculo.html', '404.html', 'styles.css', 'assets', 'js']) {
  await cp(resolve(root, file), resolve(out, file), {recursive:true});
}
console.log('Production site built in dist/');
