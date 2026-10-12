'use strict';
// La web usa caché sin conexión. Los paquetes nativos ya incluyen los archivos.
if ('serviceWorker' in navigator && ['http:', 'https:'].includes(location.protocol) && location.hostname !== 'ajedrez.local') {
  navigator.serviceWorker.register('./sw.js').catch(error => console.warn('Modo sin conexión no disponible:', error.message));
}
