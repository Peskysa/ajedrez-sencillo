'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', 'dist/web');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.webmanifest':'application/manifest+json','.png':'image/png'};
const server = http.createServer((req,res) => {
  let file;
  try {file = path.resolve(root, '.' + decodeURIComponent(req.url.split('?')[0] === '/' ? '/index.html' : req.url.split('?')[0]));}
  catch {res.writeHead(400);res.end();return;}
  if (!file.startsWith(root + path.sep)) {res.writeHead(403);res.end();return;}
  fs.readFile(file,(error,data) => {
    if (error) {res.writeHead(404);res.end('Ejecuta primero npm run build:web');return;}
    res.setHeader('Content-Type', types[path.extname(file)] || 'text/plain');
    res.setHeader('X-Content-Type-Options','nosniff');
    res.end(data);
  });
});
if (require.main === module) server.listen(8766,'127.0.0.1',() => console.log('Ajedrez: http://127.0.0.1:8766'));
module.exports = server;
