import http from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import {extname, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
const portArg = args.indexOf('--port');
const port = Number(portArg >= 0 ? args[portArg + 1] : process.env.PORT || 4173);
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'};
http.createServer(async (req, res) => {
  try {
    let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname === '/') pathname = '/index.html';
    if (!extname(pathname)) pathname += '.html';
    const file = resolve(root, '.' + pathname);
    if (!file.startsWith(root.endsWith(sep) ? root : root + sep) || !types[extname(file)]) throw new Error('Not found');
    if (!(await stat(file)).isFile()) throw new Error('Not found');
    res.writeHead(200, {'Content-Type': types[extname(file)], 'Cache-Control': 'no-store'});
    res.end(await readFile(file));
  } catch {
    res.writeHead(404, {'Content-Type':'text/html; charset=utf-8'});
    res.end(await readFile(resolve(root, '404.html')).catch(() => 'Not found'));
  }
}).listen(port, '0.0.0.0', () => console.log(`GJ Larry ready on port ${port}`));
