# Instalación

Descargas oficiales: [GitHub Releases](https://github.com/Peskysa/ajedrez-sencillo/releases/latest). Los hashes de cada publicación están en `SHA256SUMS.txt`.

## Web

Abre [el tablero](https://peskysa.github.io/ajedrez-sencillo/). Chrome y Edge ofrecen instalar la aplicación o añadirla a inicio desde su menú; la disponibilidad y el nombre dependen del navegador. Espera a que termine la primera carga con conexión. La caché guarda los archivos del juego, **no la partida**. Una actualización se aplica después de cerrar las pestañas de la versión anterior.

## Windows

Windows 10 o posterior, x64. Descarga el EXE y ejecuta el instalador; puedes elegir carpeta y acceso directo. Incluye Electron: no necesitas Node.js. No tiene firma comercial y Windows puede advertir de un editor desconocido. No se modifica la seguridad del sistema.

## Linux

Linux x64 con entorno gráfico compatible con Electron; distribuciones antiguas pueden no funcionar.

AppImage:

```sh
chmod +x ajedrez-sencillo-1.1.0-linux-x64.AppImage
./ajedrez-sencillo-1.1.0-linux-x64.AppImage
```

Si FUSE no está disponible:

```sh
./ajedrez-sencillo-1.1.0-linux-x64.AppImage --appimage-extract
./squashfs-root/AppRun
```

Debian/Ubuntu, abre el DEB en el gestor de paquetes o usa:

```sh
sudo apt install ./ajedrez-sencillo-1.1.0-linux-x64.deb
```

## Android

**PWA recomendada para uso habitual:** abre la web en Chrome e instálala desde su menú. Funciona sin red después de la primera carga.

**APK preliminar:** Android 8 o posterior y WebView actualizado. Descarga el APK de Releases y ábrelo en tu dispositivo. Android puede pedir autorización a esa aplicación para instalar archivos descargados.

El APK no solicita permiso de Internet, cámara, micrófono ni almacenamiento. No está en Google Play. Usa una firma de depuración generada durante la compilación: otra compilación puede requerir desinstalar la anterior. Para distribución estable con actualizaciones directas, el propietario debe conservar una clave de firma privada fuera del repositorio.

## ZIP portátil

Descomprime `ajedrez-sencillo-web.zip` y abre `index.html`. El juego funciona sin instalación. La instalación PWA requiere HTTPS o servidor local.

## Verificar una descarga

Windows PowerShell:

```powershell
Get-FileHash .\ajedrez-sencillo-1.1.0-win-x64.exe -Algorithm SHA256
```

Linux:

```sh
sha256sum -c SHA256SUMS.txt
```
