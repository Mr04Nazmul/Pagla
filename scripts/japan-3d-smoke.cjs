const { chromium } = require('playwright');
const fs = require('fs');
const assert = require('assert');
(async () => {
  fs.mkdirSync('test-artifacts', {recursive: true});
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl','--ignore-gpu-blocklist','--use-gl=angle','--use-angle=swiftshader']
  });
  const page = await browser.newPage({
    viewport: {width:390,height:844},
    deviceScaleFactor:2,
    isMobile:true,hasTouch:true,
    acceptDownloads:true
  });
  const fatal=[];
  page.on('pageerror', e => fatal.push(e.message));
  try {
    await page.goto('http://127.0.0.1:8765/japan/', {waitUntil:'domcontentloaded',timeout:45000});
    await page.locator('#begin').click();
    await page.waitForTimeout(12000);
    const result = await page.evaluate(() => {
      const canvas=document.querySelector('.maplibregl-canvas');
      const fail=document.getElementById('fail');
      return {
        canvas:canvas ? [canvas.width,canvas.height] : null,
        status:document.getElementById('status')?.textContent,
        buildings:document.getElementById('count')?.textContent,
        exportEnabled:!document.getElementById('export')?.disabled,
        failVisible:getComputedStyle(fail).display!=='none',
        aerialButton:!!document.getElementById('aerial'),
        introHidden:document.getElementById('overlay')?.classList.contains('hide')
      };
    });
    await page.screenshot({path:'test-artifacts/kobe-futabacho-mobile.png'});
    fs.writeFileSync('test-artifacts/report.json',JSON.stringify({result,errors:fatal},null,2));
    console.log(JSON.stringify({result,errors:fatal},null,2));
    assert.ok(result.canvas && result.canvas[0] > 0,'MapLibre canvas did not initialize');
    assert.ok(!result.failVisible,'Error overlay visible');
    assert.ok(result.introHidden,'Start button did not work');
    assert.ok(result.aerialButton,'Aerial photo toggle missing');
    assert.ok(!fatal.length,'Uncaught JavaScript exceptions: '+fatal.join(' | '));
    if(result.exportEnabled){
      const pending=page.waitForEvent('download',{timeout:60000});
      await page.locator('#export').click();
      const file=await pending;
      const destination='test-artifacts/Kobe_Futabacho_OSM_3D.glb';
      await file.saveAs(destination);
      const buf=fs.readFileSync(destination);
      assert.strictEqual(buf.subarray(0,4).toString('ascii'),'glTF','Downloaded file is not a binary GLB');
      assert.ok(buf.length>1200,'Downloaded GLB is unexpectedly small');
      console.log('Downloaded real OSM-derived GLB successfully:',buf.length,'bytes');
    }else{
      throw new Error('No usable OSM building footprints were loaded; GLB export disabled');
    }
  } finally {
    await browser.close();
  }
})().catch(e=>{console.error(e);process.exitCode=1;});