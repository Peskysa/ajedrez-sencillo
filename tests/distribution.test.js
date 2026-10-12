'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
test('La web empaquetada contiene únicamente recursos locales y licencia', () => {
  const html = fs.readFileSync(path.join(root,'dist/web/index.html'),'utf8');
  for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    if (match[1].startsWith('data:')) continue;
    assert.ok(!/^https?:/.test(match[1]));
    assert.ok(fs.existsSync(path.join(root,'dist/web',match[1])),match[1]);
  }
  assert.ok(fs.existsSync(path.join(root,'dist/web/LICENSE')));
  assert.ok(!fs.existsSync(path.join(root,'dist/web/.git')));
});
test('Manifest e iconos listos para instalar en el subdirectorio de GitHub Pages', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));
  assert.equal(manifest.scope,'./');assert.equal(manifest.start_url,'./index.html');
  for (const icon of manifest.icons) {const bytes = fs.readFileSync(path.join(root,icon.src));assert.equal(bytes.subarray(1,4).toString(),'PNG');}
  const sw = fs.readFileSync(path.join(root,'sw.js'),'utf8');
  assert.ok(sw.includes('1.1.0'));assert.ok(!sw.includes('skipWaiting'));
});
test('Android funciona sin permiso de red ni acceso a archivos del dispositivo', () => {
  const manifest = fs.readFileSync(path.join(root,'android/app/src/main/AndroidManifest.xml'),'utf8');
  assert.ok(!manifest.includes('uses-permission'));
  const java = fs.readFileSync(path.join(root,'android/app/src/main/java/io/github/peskysa/ajedrezsencillo/MainActivity.java'),'utf8');
  assert.ok(java.includes('setAllowFileAccess(false)'));assert.ok(java.includes('setAllowContentAccess(false)'));
});
