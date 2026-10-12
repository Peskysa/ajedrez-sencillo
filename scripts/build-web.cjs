'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const files = ['index.html', 'styles.css', 'app.js', 'chess.js', 'install.js', 'sw.js', 'manifest.webmanifest', 'assets/icon-192.png', 'assets/icon-512.png'];
for (const relative of files) {
  const destination = path.join(root, 'dist/web', relative);
  fs.mkdirSync(path.dirname(destination), {recursive:true});
  fs.copyFileSync(path.join(root, relative), destination);
}
fs.copyFileSync(path.join(root, 'LICENSE'), path.join(root, 'dist/web/LICENSE'));
console.log('Web preparada en dist/web');
