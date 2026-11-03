import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Pagla — mobile-first Bangladesh village 3D playable prototype.
// Assets: original CC0 1.0 models from 3dassets.dev (see ASSETS.md).
const $=s=>document.querySelector(s);
const mobile=matchMedia('(pointer: coarse)').matches;
const canvas=$('#game');
let renderer;
try {
 renderer=new THREE.WebGLRenderer({canvas,antialias:!mobile,alpha:false,powerPreference:'high-performance'});
} catch(e) {
 $('#error').hidden=false;$('#error').textContent='এই ফোনে WebGL চালু করা যাচ্ছে না: '+e.message;
 throw e;
}
renderer.setPixelRatio(Math.min(devicePixelRatio||1,mobile?1.35:1.8));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.23;
renderer.shadowMap.enabled=!mobile;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x9ab7c5);
scene.fog=new THREE.FogExp2(0xadc1aa,0.008);
const camera=new THREE.PerspectiveCamera(65,1,.13,340);
const hemi=new THREE.HemisphereLight(0xe1ecff,0x55643a,2.25);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffe0ac,2.7);
sun.position.set(-38,62,25);sun.castShadow=!mobile;
sun.shadow.mapSize.set(1024,1024);
Object.assign(sun.shadow.camera,{left:-68,right:68,top:68,bottom:-68,near:1,far:160});
sun.shadow.bias=-0.0003;scene.add(sun);
const mat=(color,roughness=1,other={})=>new THREE.MeshStandardMaterial({color,roughness,...other});
const grass=mat(0x597b44),earth=mat(0x926d4b),darkEarth=mat(0x704f33),leaf=mat(0x356130),treeTrunk=mat(0x665039),tin=mat(0x7b8584,.77,{metalness:.3});
let seed=773;function rnd(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
const rand=(a,b)=>a+(b-a)*rnd();
const roadX=z=>Math.sin(z*.031)*4+Math.sin(z*.07)*1.3;
const add=(geo,material,parent=scene,x=0,y=0,z=0)=>{const mesh=new THREE.Mesh(geo,material);mesh.position.set(x,y,z);mesh.receiveShadow=true;parent.add(mesh);return mesh;};
const box=(parent,x,y,z,w,h,d,m)=>add(new THREE.BoxGeometry(w,h,d),m,parent,x,y,z);
function texture(kind){
 const c=document.createElement('canvas');c.width=256;c.height=256;
 const ctx=c.getContext('2d');ctx.fillStyle=kind==='tin'?'#748086':kind==='wall'?'#b5a384':kind==='dirt'?'#8c6947':'#6a8b51';ctx.fillRect(0,0,256,256);
 if(kind==='tin'){
  for(let x=0;x<256;x+=8){ctx.fillStyle=x%16?'#b2bac0':'#55636a';ctx.fillRect(x,0,2,256);ctx.fillStyle='#39484e';ctx.fillRect(x+3,0,1,256);}
 }else{
  for(let i=0;i<7000;i++){
   const v=rand(0,255)|0;const a=rand(.018,.14);
   ctx.fillStyle='rgba('+v+','+Math.min(v+9,255)+','+Math.max(v-10,0)+','+a+')';
   ctx.fillRect(rand(0,256),rand(0,256),rand(.4,3),rand(.4,3));
  }
 }
 const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),4);return t;
}
const terrainMat=mat(0xffffff,1,{map:texture('grass')});
const dirtMat=mat(0xffffff,1,{map:texture('dirt')});
const wallMat=mat(0xffffff,1,{map:texture('wall')});
const roofMat=mat(0xffffff,.82,{metalness:.19,map:texture('tin'),side:THREE.DoubleSide});
const plane=add(new THREE.PlaneGeometry(240,240),terrainMat);plane.rotation.x=-Math.PI/2;plane.position.y=-.085;
const pathGeo=new THREE.BufferGeometry();
{let p=[],uv=[],idx=[];const steps=220;
 for(let i=0;i<=steps;i++){const z=-110+i,x=roadX(z);
  for(let s of [-1,1]){p.push(x+s*3.4,.008,z);uv.push(s===-1?0:1,i*.03);}
  if(i){const a=(i-1)*2,b=i*2;idx.push(a,b,a+1,b,b+1,a+1);}
 }
 pathGeo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));
 pathGeo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));pathGeo.setIndex(idx);pathGeo.computeVertexNormals();
 add(pathGeo,dirtMat);
}
// Roadside earth shoulders, ruts and occasional puddles
const wet=mat(0x587b78,.14,{metalness:.12,transparent:true,opacity:.84,depthWrite:false});
for(let z=-104;z<104;z+=5.5){
 const x=roadX(z);
 box(scene,x-2.0,.024,z,.20,.008,3.9,mat(0x654732));
 box(scene,x+2.05,.024,z,.2,.008,3.9,mat(0x654732));
 if(rnd()>.62){const p=add(new THREE.CircleGeometry(rand(.35,1.1),13),wet,scene,x+rand(-1.5,1.5),.031,z);p.rotation.x=-Math.PI/2;p.scale.y=rand(.4,1);}
}
// Agricultural plots on both sides; static light instancing for mobile GPU.
const cropMat=mat(0x6a953c,.94,{side:THREE.DoubleSide});
const plantGeo=new THREE.ConeGeometry(.075,.58,3);
const count=mobile?1350:2700;
const crops=new THREE.InstancedMesh(plantGeo,cropMat,count);crops.frustumCulled=false;
const dummy=new THREE.Object3D();let index=0,attempts=0;
while(index<count && attempts<count*8){
 attempts++;const x=rand(-108,108),z=rand(-108,108);
 if(Math.abs(x-roadX(z))<9 || (x>14&&x<34&&z>-50&&z<-25) || (Math.abs(x)<23&&z<-65&&z>-100))continue;
 dummy.position.set(x,.26,z);dummy.rotation.set(0,rand(0,6.28),rand(-.12,.12));dummy.scale.setScalar(rand(.7,1.35));dummy.updateMatrix();crops.setMatrixAt(index++,dummy.matrix);
}
crops.count=index;crops.instanceMatrix.needsUpdate=true;scene.add(crops);
// Banks and still pond.
box(scene,26,-.032,-39,24,.09,24,mat(0x7c6543));
const water=add(new THREE.PlaneGeometry(22,22),mat(0x497f80,.16,{metalness:.2,transparent:true,opacity:.82,side:THREE.DoubleSide}),scene,26,.023,-39);
water.rotation.x=-Math.PI/2;
for(let i=0;i<18;i++){const a=rand(0,Math.PI*2),r=rand(0,10);const lily=add(new THREE.CircleGeometry(rand(.15,.36),7),mat(0x649d5e),scene,26+Math.cos(a)*r,.048,-39+Math.sin(a)*r);lily.rotation.x=-Math.PI/2;}
// Village tin roof homes, fences and wooden shutters.
function house(x,z,w=7,d=6){
 const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
 box(g,0,.2,0,w+.35,.4,d+.35,mat(0x998a68));
 box(g,0,1.73,0,w,2.7,d,wallMat);
 const roofH=1.7,e=.45,y=3.08;
 const verts=[-w/2-e,y,-d/2-e,0,y+roofH,-d/2-e,0,y+roofH,d/2+e,-w/2-e,y,d/2+e,
              0,y+roofH,-d/2-e,w/2+e,y,-d/2-e,w/2+e,y,d/2+e,0,y+roofH,d/2+e];
 const uv=[0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1];const rg=new THREE.BufferGeometry();
 rg.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));rg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));rg.setIndex([0,1,2,0,2,3,4,5,6,4,6,7]);rg.computeVertexNormals();
 add(rg,roofMat,g);
 const door=box(g,0,1.05,d/2+.035,1.35,2.05,.1,mat(0x4b3726));door.castShadow=true;
 for(const xx of [-w*.29,w*.29]){
  box(g,xx,1.9,d/2+.045,.92,.94,.12,mat(0x4b5855));
  box(g,xx,1.9,d/2+.115,.08,1,.07,mat(0xb8a68e));
  box(g,xx,1.9,d/2+.115,.92,.07,.07,mat(0xb8a68e));
 }
 for(let i=0;i<6;i++){const xx=-w/2+i*w/5;box(g,xx,.56,d/2+1.2,.08,1.07,.08,treeTrunk);box(g,xx,.53,-d/2-1.2,.08,1,.08,treeTrunk);}
 for(const zz of [-d/2-1.2,d/2+1.2])box(g,0,.77,zz,w+1.5,.07,.07,treeTrunk);
 return g;
}
for(let i=0;i<15;i++){
 const z=-101+i*13,x=roadX(z)+(i%2===0?rand(12,18):-rand(12,19));
 if((x>13 && z>-53 && z<-25)||(z<-91&&z>-105))continue;
 const g=house(x,z,rand(5.2,8),rand(4.5,7.3));g.rotation.y=rand(-.3,.3);
}
house(14,-22,7,6);
house(-19,-84,8.5,7);
// Tea stall roof and benches at bazaar.
box(scene,-15,3.0,-78,8,.18,6,tin);
for(const dx of [-3.8,3.8])for(const dz of [-2.7,2.7])box(scene,-15+dx,1.52,-78+dz,.15,3,.15,treeTrunk);
box(scene,-14.7,.45,-74.3,5.1,.18,.65,mat(0x765639));
box(scene,-14.7,.22,-74.3,4.9,.5,.13,treeTrunk);
// Ambient trees: modest geometry draw cost.
const crownMats=[mat(0x2c5930),mat(0x477a37),mat(0x365f2b)];
const sphere=new THREE.IcosahedronGeometry(1,1);
function tree(x,z,height){
 const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
 add(new THREE.CylinderGeometry(.10,.27,height,6),treeTrunk,g,0,height/2,0);
 for(let i=0;i<4;i++){
  const size=rand(1.4,2.3);const m=add(sphere,crownMats[i%3],g,rand(-1.4,1.4),height+rand(-.3,.9),rand(-1.4,1.4));
  m.scale.set(size,size*.8,size);
 }
}
for(let i=0;i<28;i++){
 const x=rand(-93,93),z=rand(-104,103);
 if(Math.abs(x-roadX(z))>10 && Math.hypot(x-26,z+39)>16)tree(x,z,rand(3.8,6));
}
// Light utility poles and wires.
const cable=mat(0x242c2d,.9);
for(let z=-104;z<=100;z+=32){const x=roadX(z)-6;
 add(new THREE.CylinderGeometry(.065,.12,6.3,7),mat(0x8c8980),scene,x,3.15,z);
 box(scene,x,6.08,z,1.35,.10,.10,mat(0x514b3b));
}
// Character and animated footsteps.
const player=new THREE.Group();scene.add(player);
const skin=mat(0xb88762,.95),shirt=mat(0x303d39),trouser=mat(0x2f393f),hair=mat(0x1d1917);
const torso=box(player,0,1.29,0,.72,.82,.38,shirt);
const head=add(new THREE.SphereGeometry(.225,10,8),skin,player,0,1.93,0);
add(new THREE.SphereGeometry(.223,9,6,0,Math.PI*2,0,Math.PI*.50),hair,player,0,2.025,0);
const arms=[],legs=[];
for(const s of [-1,1]){
 const arm=new THREE.Group();arm.position.set(s*.48,1.58,0);player.add(arm);
 box(arm,0,-.29,0,.23,.63,.23,shirt);arms.push(arm);
 const leg=new THREE.Group();leg.position.set(s*.19,.87,0);player.add(leg);
 box(leg,0,-.38,0,.27,.76,.30,trouser);
 box(leg,0,-.74,-.10,.31,.16,.48,mat(0x272623));legs.push(leg);
}
// Vehicle is actually driveable; imported CC0 model replaces its fallback.
const driveGroup=new THREE.Group();scene.add(driveGroup);
const fallbackCar=new THREE.Group();driveGroup.add(fallbackCar);
box(fallbackCar,0,.85,0,1.5,1.2,2.35,mat(0x26754d));
box(fallbackCar,0,1.92,-.15,1.65,.14,2.45,mat(0x1d2925));
for(let a of [-.78,.78])for(let b of [-.65,.73]) {
 const wh=add(new THREE.CylinderGeometry(.36,.36,.16,11),mat(0x282a2a),fallbackCar,a,.42,b);wh.rotation.z=Math.PI/2;
}
const state={x:roadX(12),z:12,heading:Math.PI,speed:0,riding:false,playing:false,moving:false};
const vehicle={x:roadX(2)+5,z:2,heading:-.28};
const destinations=[{x:14,z:-22,name:'🏠 গ্রামের বাড়ি'},{x:26,z:-39,name:'🌿 পুকুরপাড়'},{x:-15,z:-78,name:'☕ চায়ের দোকান'}];
let goal=0;let toastTimeout;
function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>el.classList.remove('show'),2200);}
function interact(){
 if(state.riding){
  state.riding=false;state.speed=0;vehicle.x=state.x+3;vehicle.z=state.z;vehicle.heading=state.heading;
  toast('🛺 অটোরিকশা থেকে নেমেছ');return;
 }
 if(Math.hypot(state.x-vehicle.x,state.z-vehicle.z)<6){state.riding=true;state.heading=vehicle.heading;toast('🛺 Joystick দিয়ে চালাও');}
 else toast('অটোরিকশার কাছে যাও');
}
$('#action').addEventListener('click',interact);
$('#start').addEventListener('click',()=>{$('#intro').hidden=true;state.playing=true;toast('🇧🇩 গ্রামবাংলায় স্বাগতম!');});
$('#camera').addEventListener('click',()=>{yaw+=Math.PI*.5;});
let yaw=0,pitch=.26,runHeld=false;
const keys=new Set(),stick={x:0,y:0};
addEventListener('keydown',e=>{keys.add(e.code);if(e.code==='KeyF'&&!e.repeat)interact();if(e.code.startsWith('Arrow'))e.preventDefault();});
addEventListener('keyup',e=>keys.delete(e.code));
addEventListener('blur',()=>{keys.clear();stick.x=stick.y=0;runHeld=false;});
const stickEl=$('#joystick'),knob=$('#knob');let stickId=null;
function stickMove(e){
 const r=stickEl.getBoundingClientRect(),dx=(e.clientX-(r.left+r.width/2))/40,dy=(e.clientY-(r.top+r.height/2))/40,l=Math.max(1,Math.hypot(dx,dy));
 stick.x=dx/l;stick.y=dy/l;knob.style.transform='translate('+(stick.x*37)+'px,'+(stick.y*37)+'px)';
}
stickEl.addEventListener('pointerdown',e=>{stickId=e.pointerId;stickEl.setPointerCapture(e.pointerId);stickMove(e);});
stickEl.addEventListener('pointermove',e=>{if(e.pointerId===stickId)stickMove(e);});
for(const ev of ['pointerup','pointercancel'])stickEl.addEventListener(ev,e=>{if(e.pointerId===stickId){stickId=null;stick.x=stick.y=0;knob.style.transform='';}});
const sprint=$('#run');
for(const ev of ['pointerdown','touchstart'])sprint.addEventListener(ev,e=>{runHeld=true;e.preventDefault();},{passive:false});
for(const ev of ['pointerup','pointercancel','touchend'])sprint.addEventListener(ev,()=>{runHeld=false;});
let lastTouch=null;
canvas.addEventListener('pointerdown',e=>{lastTouch={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{
 if(!lastTouch||e.pointerId!==lastTouch.id)return;
 yaw-=(e.clientX-lastTouch.x)*.0043;
 pitch=THREE.MathUtils.clamp(pitch+(e.clientY-lastTouch.y)*.003,.1,.72);
 lastTouch.x=e.clientX;lastTouch.y=e.clientY;
});
for(const ev of ['pointerup','pointercancel'])canvas.addEventListener(ev,()=>{lastTouch=null;});
// Minimap without external dependency.
function drawMap(){
 const m=$('#minimap'),c=m.getContext('2d'),sz=m.width;
 c.fillStyle='#5e7e47';c.fillRect(0,0,sz,sz);
 const sc=1.22,loc=(x,z)=>[sz/2+(x-state.x)*sc,sz/2+(z-state.z)*sc];
 c.strokeStyle='#be986c';c.lineWidth=9;c.lineCap='round';c.beginPath();
 for(let z=state.z-85;z<=state.z+85;z++){const p=loc(roadX(z),z);if(z===state.z-85)c.moveTo(...p);else c.lineTo(...p);}c.stroke();
 c.fillStyle='#5c9695';let pt=loc(26,-39);c.fillRect(pt[0]-10,pt[1]-10,20,20);
 destinations.forEach((g,i)=>{const p=loc(g.x,g.z);c.fillStyle=i<goal?'#dfefcb':i===goal?'#ffda69':'#b8c0a7';c.beginPath();c.arc(...p,i===goal?6:3,0,Math.PI*2);c.fill();});
 c.save();c.translate(sz/2,sz/2);c.rotate(-state.heading);c.fillStyle='#fff';c.beginPath();c.moveTo(0,-10);c.lineTo(-6,8);c.lineTo(6,8);c.fill();c.restore();
}
let frames=0,prev=performance.now();const focus=new THREE.Vector3(),desired=new THREE.Vector3();
function step(dt,now){
 if(!state.playing)return;
 let dx=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0)+stick.x;
 let dz=(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-(keys.has('KeyW')||keys.has('ArrowUp')?1:0)+stick.y;
 const len=Math.hypot(dx,dz);state.moving=len>.05;
 if(state.moving){
  dx/=Math.max(1,len);dz/=Math.max(1,len);
  const fx=Math.cos(yaw)*dx-Math.sin(yaw)*dz,fz=Math.sin(yaw)*dx+Math.cos(yaw)*dz;
  const speed=state.riding?10.2:(runHeld||keys.has('ShiftLeft')?6.9:3.65);
  state.x=THREE.MathUtils.clamp(state.x+fx*speed*dt,-113,113);state.z=THREE.MathUtils.clamp(state.z+fz*speed*dt,-113,113);
  state.heading=Math.atan2(-fx,-fz);state.speed=speed;
 }else state.speed=Math.max(0,state.speed-18*dt);
 player.visible=!state.riding;
 if(!state.riding){
  player.position.set(state.x,Math.sin(now*.006)*.015*(state.moving?1:0),state.z);
  player.rotation.y=state.heading;
  for(let i=0;i<2;i++){const swing=state.moving?Math.sin(now*.009+i*Math.PI)*.42:0;legs[i].rotation.x=swing;arms[i].rotation.x=-swing*.7;}
 }else {vehicle.x=state.x;vehicle.z=state.z;vehicle.heading=state.heading;}
 driveGroup.position.set(vehicle.x,0,vehicle.z);driveGroup.rotation.y=vehicle.heading;
 if(goal<destinations.length&&Math.hypot(state.x-destinations[goal].x,state.z-destinations[goal].z)<5.8){
  toast('✅ '+destinations[goal].name+' পৌঁছেছ');goal++;
  $('#objective').textContent=goal===destinations.length?'🏆 তিনটি মিশন সম্পন্ন':'📍 '+destinations[goal].name;
  $('#mission').textContent=goal+'/৩ মিশন সম্পন্ন';
 }
 const near=Math.hypot(state.x-vehicle.x,state.z-vehicle.z)<6;
 $('#action').disabled=!state.riding&&!near;
 $('#action').innerHTML=state.riding?'🚶 নামো':'🛺 উঠো';
 $('#speed').textContent=(state.riding?'🛺 CNG':'🚶 হাঁটা')+' • '+Math.round(state.speed*3.6)+' km/h';
}
function resize(){
 const w=window.innerWidth,h=window.innerHeight;
 if(canvas.width!==Math.round(w*renderer.getPixelRatio())||canvas.height!==Math.round(h*renderer.getPixelRatio())){
  renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
 }
}
function render(now){
 const dt=Math.min(.05,(now-prev)/1000||.016);prev=now;resize();step(dt,now);
 focus.set(state.x,1.3,state.z);
 const dist=state.riding?10:6.5;
 desired.set(state.x+Math.sin(yaw)*dist*Math.cos(pitch),1.45+dist*Math.sin(pitch),state.z+Math.cos(yaw)*dist*Math.cos(pitch));
 if(camera.position.lengthSq()===0)camera.position.copy(desired);
 camera.position.lerp(desired,Math.min(1,dt*4.5));camera.lookAt(focus);
 renderer.render(scene,camera);
 if(++frames%10===0)drawMap();
 requestAnimationFrame(render);
}
// Optional imported GLBs. Engine and gameplay keep running if CDN or model fails.
const loader=new GLTFLoader();
const assetList=[
 {id:'banana',url:'https://cdn.3dassets.dev/assets/38579/v1/model.glb',locs:[[8,-5],[-14,20],[21,13],[-27,-48],[37,-68],[13,-97]]},
 {id:'bamboo',url:'https://cdn.3dassets.dev/assets/38590/v1/model.glb',locs:[[-24,1],[35,39],[-34,-82],[43,-15]]},
 {id:'tea',url:'https://cdn.3dassets.dev/assets/36551/v1/model.glb',locs:[[-15,-77]]},
 {id:'cng',url:'https://cdn.3dassets.dev/assets/36560/v1/model.glb',vehicle:true},
 {id:'bike',url:'https://cdn.3dassets.dev/assets/36564/v1/model.glb',locs:[[roadX(-56)+6,-56]]},
 {id:'cycle',url:'https://cdn.3dassets.dev/assets/36561/v1/model.glb',locs:[[-20,-75]]}
];
let loaded=0,failed=0;
const status=$('#assets');
assetList.forEach(a=>{
 loader.load(a.url,gltf=>{
  if(a.vehicle){
   fallbackCar.visible=false;
   driveGroup.add(gltf.scene);
  }else{
   for(const [x,z] of a.locs){
    const clone=gltf.scene.clone(true);clone.position.set(x,0,z);clone.rotation.y=rand(0,Math.PI*2);
    scene.add(clone);
   }
  }
  loaded++;status.textContent='3D assets: '+loaded+'/'+assetList.length+' loaded'+(failed?' ('+failed+' unavailable)':'');
 },undefined,e=>{
  failed++;status.textContent='3D assets: '+loaded+'/'+assetList.length+' loaded · '+failed+' unavailable';
  console.warn('Optional 3D asset unavailable:',a.id,e);
 });
});
$('#assets').textContent='3D assets: loading…';
camera.position.set(state.x+2,6,state.z+7);
requestAnimationFrame(render);
