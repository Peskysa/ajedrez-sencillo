'use strict';
const {app, BrowserWindow, protocol, net, session, Menu} = require('electron');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
protocol.registerSchemesAsPrivileged([{scheme:'ajedrez', privileges:{standard:true,secure:true,supportFetchAPI:true}}]);
function createWindow() {
  const window = new BrowserWindow({width:1160,height:960,minWidth:380,minHeight:520,title:'Ajedrez sencillo',icon:path.join(__dirname,'../assets/icon-512.png'),backgroundColor:'#f5f3ec',autoHideMenuBar:true,webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true}});
  window.webContents.setWindowOpenHandler(() => ({action:'deny'}));
  window.webContents.on('will-navigate',(event,url) => {if (url !== 'ajedrez://game/index.html') event.preventDefault();});
  window.loadURL('ajedrez://game/index.html');
}
app.whenReady().then(() => {
  const root = path.resolve(__dirname,'../dist/web');
  protocol.handle('ajedrez', request => {
    const url = new URL(request.url);
    let file;
    try {file = path.resolve(root, '.' + decodeURIComponent(url.pathname));} catch {return new Response('Bad request',{status:400});}
    if (url.host !== 'game' || !file.startsWith(root + path.sep)) return new Response('Forbidden',{status:403});
    return net.fetch(pathToFileURL(file).toString());
  });
  session.defaultSession.setPermissionRequestHandler((_contents,_permission,callback) => callback(false));
  session.defaultSession.setPermissionCheckHandler(() => false);
  Menu.setApplicationMenu(null);
  createWindow();
  app.on('activate',() => {if (!BrowserWindow.getAllWindows().length) createWindow();});
});
app.on('window-all-closed',() => {if (process.platform !== 'darwin') app.quit();});
