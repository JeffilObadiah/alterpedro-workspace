import http from 'node:http'; import { readFileSync, existsSync } from 'node:fs'; import { gzipSync } from 'node:zlib'; import { join } from 'node:path';
const root = '/workspace/alterpedro/dist';
http.createServer((q, r) => {
  let p = q.url.split('?')[0]; if (p.endsWith('/')) p += 'index.html';
  const f = join(root, p);
  if (!existsSync(f)) { r.writeHead(404); return r.end('nf'); }
  const body = readFileSync(f); const type = f.endsWith('.html') ? 'text/html; charset=utf-8' : f.endsWith('.js') ? 'text/javascript' : f.endsWith('.css') ? 'text/css' : 'application/octet-stream';
  const gz = /gzip/.test(q.headers['accept-encoding'] || '');
  r.writeHead(200, { 'content-type': type, 'cache-control': 'no-store', ...(q.url.includes('nojs') ? { 'content-security-policy': "script-src 'none'" } : {}), ...(gz ? { 'content-encoding': 'gzip' } : {}) });
  r.end(gz ? gzipSync(body) : body);
}).listen(4173, () => console.log('serving'));
