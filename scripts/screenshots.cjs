'use strict';
// Capturas reproducibles del juego real. No son maquetas.
const {chromium} = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const server = require('./serve.cjs');
(async () => {
  fs.mkdirSync(path.resolve(__dirname,'../docs/images'),{recursive:true});
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  const browser = await chromium.launch(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {});
  try {
    const page = await browser.newPage({viewport:{width:1280,height:1050},deviceScaleFactor:1});
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    await page.locator('#board button').last().waitFor();
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload();
    await page.context().setOffline(true);
    await page.reload();
    if (await page.locator('#board button').count() !== 64) throw Error('La web no carga sin conexión');
    await page.context().setOffline(false);
    await page.screenshot({path:'docs/images/escritorio.png',fullPage:true});
    await page.locator('[data-square="e2"]').click();
    await page.screenshot({path:'docs/images/movimientos.png',fullPage:true});
    await page.setViewportSize({width:390,height:844});
    await page.reload();
    for (const move of ['a2a4','h7h5','a4a5','h5h4','a5a6','h4h3','a6b7','h3g2','b7a8']) {
      await page.locator(`[data-square="${move.slice(0,2)}"]`).click();
      await page.locator(`[data-square="${move.slice(2,4)}"]`).click();
    }
    await page.locator('#promotion-dialog[open]').waitFor();
    await page.screenshot({path:'docs/images/movil.png'});
    await page.getByRole('button',{name:'caballo',exact:true}).click();
    if ((await page.locator('[data-square="a8"]').getAttribute('aria-label')) !== 'a8: caballo de blancas') throw Error('Coronación incorrecta');
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw Error('Desbordamiento horizontal');
  } finally {await browser.close();await new Promise(resolve => server.close(resolve));}
})().catch(error => {console.error(error);process.exitCode=1;server.close();});
