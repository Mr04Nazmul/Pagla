const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  fs.mkdirSync('test-artifacts', {recursive:true});
  const browser=await chromium.launch({
    headless:true,
    args:['--enable-webgl','--ignore-gpu-blocklist','--use-gl=angle','--use-angle=swiftshader']
  });
  const page=await browser.newPage({
    viewport:{width:390,height:844},deviceScaleFactor:2,
    isMobile:true,hasTouch:true,deviceName:'Pagla mobile smoke'
  });
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',e=>{if(e.type()==='error' && !/glb|texture|failed to load/i.test(e.text())) console.log('console:',e.text().slice(0,250));});
  try{
    await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded',timeout:45000});
    await page.waitForSelector('#start',{timeout:45000});
    await page.waitForTimeout(1800);
    await page.locator('#start').click({timeout:25000});
    await page.waitForFunction(()=>document.getElementById('splash')?.classList.contains('hidden'),null,{timeout:25000});
    await page.waitForTimeout(5500);
    const result=await page.evaluate(()=>{
      const c=document.getElementById('game'),fps=document.getElementById('fps')?.textContent||'';
      return {canvasSize:[c.width,c.height],fps,photoStatus:document.getElementById('photoStatus')?.textContent||'',upgrade:document.getElementById('upgrade')?.textContent||'',failVisible:getComputedStyle(document.getElementById('fail')).display!=='none'};
    });
    await page.screenshot({path:'test-artifacts/pagla-mobile.png'});
    console.log(JSON.stringify(result,null,2));
    if(errors.length)throw new Error('Uncaught page errors: '+errors.slice(0,4).join(' | '));
    if(result.canvasSize[0]<=0||result.canvasSize[1]<=0)throw new Error('WebGL canvas not sized');
    if(result.failVisible)throw new Error('3D game entered fatal error UI');
    if(!/FPS/.test(result.fps))throw new Error('No animation/FPS signal');
    if(!/Real photo textures/.test(result.photoStatus))throw new Error('Photographic material pipeline did not start');
  }catch(e){
    await page.screenshot({path:'test-artifacts/pagla-mobile-failed.png'}).catch(()=>{});
    console.error(e);
    process.exitCode=1;
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});