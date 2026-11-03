// GitHub Actions smoke test — device-like viewport, not actual iPhone/Android GPU.
import { chromium } from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const base = process.env.PAGLA_TEST_URL || 'http://127.0.0.1:8765/';
fs.mkdirSync('test-artifacts', {recursive:true});
const browser=await chromium.launch({headless:true,args:[
  '--enable-webgl','--use-gl=angle','--use-angle=swiftshader',
  '--enable-unsafe-swiftshader','--disable-dev-shm-usage'
]});
let ok=0;
try {
  for(const device of [
    {name:'iphone_like',width:390,height:844},
    {name:'android_like',width:412,height:915},
    {name:'landscape',width:844,height:390}
  ]){
    const context=await browser.newContext({
      viewport:{width:device.width,height:device.height},
      deviceScaleFactor:Math.min(2,device.width>500?1.25:2),
      isMobile:true,hasTouch:true
    });
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    try {
      const resp=await page.goto(base,{waitUntil:'domcontentloaded',timeout:35000});
      assert(resp && resp.ok(),'index.html must load');
      await page.locator('#start').click({timeout:10000});
      await page.waitForTimeout(6500);
      const state=await page.evaluate(()=>{
        const canvas=document.getElementById('game');
        const rect=canvas.getBoundingClientRect();
        const failure=document.getElementById('fail');
        return {
          canvasW:rect.width,canvasH:rect.height,
          started:document.getElementById('splash').classList.contains('hidden'),
          failureOpen:getComputedStyle(failure).display!=='none',
          failText:document.getElementById('failMsg').textContent,
          fps:document.getElementById('fps').textContent,
          mission:document.getElementById('mission').textContent,
          cash:document.getElementById('money')?.textContent,
          joystick:!!document.getElementById('joystick'),
          graphics:document.getElementById('toggle')?.textContent
        };
      });
      console.log(device.name,JSON.stringify({state,errors:errors.slice(0,6)}));
      await page.screenshot({path:'test-artifacts/'+device.name+'.png',fullPage:true});
      assert.equal(state.started,true,'Start must open 3D world');
      assert.equal(state.failureOpen,false,'WebGL error panel must stay hidden');
      assert(state.canvasW>=300&&state.canvasH>=300,'WebGL canvas visible');
      assert(state.fps.includes('FPS'),'Game loop should run');
      assert(state.mission.includes('গ্রামের সমস্যা'),'Quest HUD visible');
      assert(state.cash?.includes('৳'),'Mission currency HUD visible');
      assert.equal(errors.length,0,'No uncaught JavaScript errors');
      await page.locator('#toggle').click();
      assert((await page.locator('#toggle').innerText()).includes('GRAPHICS:'),'Graphics quality toggles');
      ok++;
    } catch(e) {
      console.error('FAIL '+device.name,e);
      await page.screenshot({path:'test-artifacts/'+device.name+'_failure.png',fullPage:true}).catch(()=>{});
      throw e;
    } finally {await context.close();}
  }
  console.log('PASS '+ok+' responsive WebGL smoke tests');
}finally{await browser.close();}
