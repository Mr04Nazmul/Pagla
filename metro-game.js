import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
const $=id=>document.getElementById(id);
const stations=[
['উত্তরা উত্তর','UTTARA NORTH'],['উত্তরা সেন্টার','UTTARA CENTER'],['উত্তরা দক্ষিণ','UTTARA SOUTH'],
['পল্লবী','PALLABI'],['মিরপুর ১১','MIRPUR 11'],['মিরপুর ১০','MIRPUR 10'],['কাজীপাড়া','KAZIPARA'],
['শেওড়াপাড়া','SHEWRAPARA'],['আগারগাঁও','AGARGAON'],['বিজয় সরণি','BIJOY SARANI'],
['ফার্মগেট','FARMGATE'],['কারওয়ান বাজার','KARWAN BAZAR'],['শাহবাগ','SHAHBAG'],
['ঢাকা বিশ্ববিদ্যালয়','DHAKA UNIVERSITY'],['বাংলাদেশ সচিবালয়','BANGLADESH SECRETARIAT'],['মতিঝিল','MOTIJHEEL']
].map((v,i)=>({bn:v[0],en:v[1],z:i*420,idx:i}));
for(const s of stations){const op=document.createElement('option');op.value=s.idx;op.textContent=s.bn+' · '+s.en;$('jump').append(op);}
let scene=new THREE.Scene();scene.background=new THREE.Color('#8ebbd0');scene.fog=new THREE.Fog('#8ebbd0',230,1350);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance',alpha:false});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.38;
$('stage').appendChild(renderer.domElement);
const camera=new THREE.PerspectiveCamera(62,innerWidth/innerHeight,.5,2200);
const ambient=new THREE.HemisphereLight(0xe1f4ff,0x7c7160,2.05);scene.add(ambient);
const sun=new THREE.DirectionalLight(0xfff2d3,2.45);sun.position.set(-180,330,220);scene.add(sun);
const mat=(c,rough=.88,metal=0)=>new THREE.MeshStandardMaterial({color:c,roughness:rough,metalness:metal,side:THREE.FrontSide});
const M={road:mat('#333d43'),ground:mat('#69816e'),grass:mat('#64835c'),line:mat('#f3ede1'),yellow:mat('#d8b547'),concrete:mat('#d6d4c9'),darkConcrete:mat('#8a9192'),rail:mat('#929eaa',.32,.7),tie:mat('#454a50'),green:mat('#147b64',.5,.25),glass:mat('#1a4658',.25,.65),red:mat('#a6443a'),cream:mat('#f8f5e9'),black:mat('#202a31'),leaf:mat('#327b3c'),leaf2:mat('#4d994c'),bark:mat('#74503c'),sidewalk:mat('#b6b4a3'),water:mat('#438ca1',.4)};
const box=(w,h,d,m,x,y,z,parent=scene)=>{const obj=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);obj.position.set(x,y,z);parent.add(obj);return obj;};
const cyl=(rt,rb,h,m,x,y,z,parent=scene,seg=8)=>{const obj=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),m);obj.position.set(x,y,z);parent.add(obj);return obj;};
const line=(a,b,m,r=.09,parent=scene)=>{const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),dir=vb.clone().sub(va);const obj=new THREE.Mesh(new THREE.CylinderGeometry(r,r,dir.length(),5),m);obj.position.copy(va.clone().add(vb).multiplyScalar(.5));obj.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize());parent.add(obj);return obj;};
const rand=(seed)=>()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
const meshText=(a,b)=>{const c=document.createElement('canvas');c.width=1024;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle='#e7f3ed';ctx.fillRect(0,0,1024,256);ctx.fillStyle='#0e937c';ctx.fillRect(0,0,1024,18);ctx.fillRect(0,238,1024,18);ctx.fillStyle='#15515a';ctx.textAlign='center';ctx.font='bold 72px system-ui';ctx.fillText(a,512,107);ctx.font='bold 66px Arial';ctx.fillText(b,512,196);const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;return new THREE.MeshBasicMaterial({map:tx,side:THREE.DoubleSide});};
function facadeTexture(t){const colors=[['#dfc8a9','#2e5870','#f2ebd7'],['#cfc8bd','#335971','#e6e5da'],['#b58978','#244e67','#e4c4ab'],['#b9d4cd','#3d6480','#ecede5'],['#e0d6bf','#405e6a','#eee9d9'],['#c0c6c6','#36556a','#e2e9e2']];const [bg,win,trim]=colors[t%colors.length];const c=document.createElement('canvas');c.width=256;c.height=512;const g=c.getContext('2d');g.fillStyle=bg;g.fillRect(0,0,256,512);g.fillStyle='#00000022';for(let y=0;y<512;y+=64){g.fillRect(0,y,256,4);}for(let y=18;y<512;y+=64){for(let x=17;x<247;x+=48){g.fillStyle=trim;g.fillRect(x-4,y-3,38,43);g.fillStyle=win;g.fillRect(x,y,30,34);g.fillStyle='#94bfd03e';g.fillRect(x+3,y+2,10,30);g.fillStyle='#b5ad9e';g.fillRect(x-6,y+36,42,5);}}const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;tx.wrapS=THREE.RepeatWrapping;tx.wrapT=THREE.RepeatWrapping;return tx;}
const facadeMats=Array.from({length:6},(_,i)=>new THREE.MeshStandardMaterial({map:facadeTexture(i),roughness:.9}));
function tree(x,z,parent,r=4){cyl(.48,.8,6,M.bark,x,3,z,parent);const foliage=new THREE.Mesh(new THREE.IcosahedronGeometry(r,1),Math.abs(x)%3<1?M.leaf:M.leaf2);foliage.position.set(x,8,z);parent.add(foliage);}
function car(x,z,dir,color,parent){const g=new THREE.Group();g.position.set(x,1.5,z);g.rotation.y=dir?0:Math.PI;box(2.2,1.2,4.9,mat(color,.47,.1),0,0,0,g);box(1.9,.7,2.4,M.glass,0,.83,-.15,g);for(let a of [-1,1])for(let b of [-1.5,1.6]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.43,.43,.2,12),M.black);w.rotation.z=Math.PI/2;w.position.set(a*1.13,-.55,b);g.add(w);}parent.add(g);return g;}
const length=stations.at(-1).z+580;
box(680,.1,length+800,M.ground,0,-.32,(length-450)/2);
for(let sx of [-74,74]){box(85,.22,length+800,M.road,sx,.1,(length-450)/2);for(let lane of [-27,-9,9,27])for(let z=-300;z<length+150;z+=26)box(.43,.038,10,M.line,sx+lane,.24,z);}
for(let side of [-1,1]){box(10,.3,length+800,M.sidewalk,side*121,.26,(length-450)/2);box(2,.2,length+800,M.yellow,side*113,.30,(length-450)/2);}
box(15,1.1,length+800,M.concrete,0,18.5,(length-450)/2);
box(1.2,.45,length+800,M.tie,0,19.28,(length-450)/2);
for(let z=-350;z<length+300;z+=4.5)box(9,.32,.7,M.tie,0,19.75,z);
for(let x of [-3.4,3.4])box(.16,.31,length+800,M.rail,x,20.0,(length-450)/2);
for(let z=-280;z<length+220;z+=34){const p=new THREE.Group();p.position.z=z;scene.add(p);cyl(2.8,3.8,18,M.darkConcrete,0,9,z);box(12,2.2,7.5,M.concrete,0,18,z);box(.36,12,.36,M.rail,-5.9,27,z);box(8,.2,.2,M.rail,-2,33,z);line([-1,33,z],[-1,35,z],M.rail,.07);line([-1,35,z],[-1,35,z+34],M.black,.06);}
const districts=[];
for(const s of stations){
const group=new THREE.Group();group.position.z=s.z;scene.add(group);districts.push(group);
for(let side of [-1,1]){
box(4,.4,116,M.concrete,side*24,19.65,0,group);
for(let localZ of [-57,57]){box(6.4,12,3.4,M.concrete,side*20,25.7,localZ,group);}
}
box(45,2.2,123,M.darkConcrete,0,20,0,group);
box(33,1.2,105,M.sidewalk,0,22.4,0,group);
for(let x of [-25,25]){box(2,9,122,M.concrete,x,25,0,group);}
const roofGeom=new THREE.BufferGeometry();const verts=[];const indexes=[];const levels=24;for(let j=0;j<=2;j++){const z=-64+j*64;for(let i=0;i<=levels;i++){const u=i/levels,x=(u-.5)*57,y=35+10*(1-Math.pow((u-.5)*2,2));verts.push(x,y,z);}}
for(let j=0;j<2;j++)for(let i=0;i<levels;i++){const a=j*(levels+1)+i,b=a+levels+1;indexes.push(a,b,a+1,a+1,b,b+1);}
roofGeom.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));roofGeom.setIndex(indexes);roofGeom.computeVertexNormals();const roof=new THREE.Mesh(roofGeom,new THREE.MeshStandardMaterial({color:'#198464',side:THREE.DoubleSide,roughness:.43,metalness:.25}));group.add(roof);
for(let j=-60;j<=60;j+=15){const a=[-25,38,j],b=[25,38,j];line(a,b,M.concrete,.25,group);}
for(let zz of [-68,68]){
const board=new THREE.Mesh(new THREE.PlaneGeometry(22,5.6),meshText(s.bn,s.en));board.position.set(0,31,zz);if(zz<0)board.rotation.y=Math.PI;group.add(board);
for(let x of [-23,23]){box(4,18,6,M.concrete,x,9,zz*1.18,group);box(6,2,10,M.green,x,18.9,zz*1.18,group);}
}
for(let x of [-1,1]){box(6,1.3,32,M.green,x*34,11,0,group);box(1.5,12,1.5,M.concrete,x*34,6,0,group);}
const rng=rand(600+s.idx*991),skyscraper=s.en==='MOTIJHEEL'||s.en==='FARMGATE'||s.en==='KARWAN BAZAR';
for(let side of [-1,1]){
for(let i=0;i<15;i++){
let z=-190+i*27+(rng()-.5)*12,x=side*(152+rng()*80),w=13+rng()*21,d=15+rng()*20,h=16+rng()*(skyscraper?96:69);
if(s.en==='AGARGAON' && side<0 && i<4)h*=.6;
const building=box(w,h,d,facadeMats[Math.floor(rng()*6)],x,h/2,z,group);building.rotation.y=(rng()-.5)*.09;
box(w*.95,.7,d*.95,M.concrete,x,h+.25,z,group);
if(rng()>.55){box(2.6,2,2.7,M.darkConcrete,x,h+1.7,z,group);}
if(i%3===0){tree(side*(127+rng()*8),z+8,group,2.9+rng()*2);}
}
for(let j=0;j<8;j++)tree(side*(116+rng()*15),-170+j*45,group,2.5+rng()*1.5);
}
for(let z of [-84,84])for(let side of [-1,1])for(let k=0;k<5;k++)box(.9,.06,5,M.line,side*(40+k*8),.38,z,group);
if(s.en==='AGARGAON'){box(27,.16,55,M.water,-232,.1,-110,group);for(let i=0;i<5;i++)tree(-202,-160+i*22,group,3);}
if(s.en==='MOTIJHEEL'){for(let j=0;j<5;j++)box(14,3,14,M.concrete,(-1+j)*23,1.5,165,group);}
}
const traffic=[],trafColors=['#f8f8f0','#e64c3e','#e9bd3a','#2c78bb','#158c66','#c0c0bd'];
for(let i=0;i<58;i++){const lane=Math.floor(i%8),side=i%2===0?-1:1,x=side*(74+[-28,-9,9,27][lane%4]),z=((i*137)%length)-170;const obj=car(x,z,side<0,trafColors[i%6],scene);obj.userData={base:z,side,speed:6+(i%7)*1.7};traffic.push(obj);}
const train=new THREE.Group();scene.add(train);
const carriageBody=mat('#e9f1f0',.32,.38),band=mat('#1eae89',.55),door=mat('#b8d2d4',.38,.2),cabmat=mat('#1d303c',.24,.45);
for(let i=0;i<6;i++){const carZ=47.5-i*19;const coach=new THREE.Group();coach.position.z=carZ;train.add(coach);box(5.6,4.2,17.3,carriageBody,0,24.1,0,coach);box(5.67,.42,17.2,band,0,22.4,0,coach);box(5.35,.35,16.4,M.black,0,26.25,0,coach);for(let side of [-1,1]){for(let k of [-6,-3,0,3,6])box(.06,1.25,1.62,k===-3||k===3?door:M.glass,side*2.83,24.8,k,coach);for(let k of [-4.4,4.4])box(.08,3.1,.12,M.green,side*2.9,23.9,k,coach);}
for(let k of [-5.5,5.5]){box(5.1,.45,2.2,M.black,0,21.5,k,coach);for(let side of [-2.2,2.2]){const wh=new THREE.Mesh(new THREE.CylinderGeometry(.53,.53,.35,12),M.black);wh.rotation.z=Math.PI/2;wh.position.set(side,21.1,k);coach.add(wh);}}
if(i===0||i===5){box(5.5,2.2,.18,cabmat,0,24.7,i===0?8.75:-8.75,coach);box(5.2,.43,.27,M.red,0,22.55,i===0?8.88:-8.88,coach);}
}
const pantograph=mat('#48565b',.3,.6);line([-1,26.7,28],[0,30.5,29],pantograph,.12,train);line([0,30.5,29],[1,26.7,30],pantograph,.12,train);box(3,.1,.2,pantograph,0,30.6,29,train);
let trainZ=-230,speed=0,throttle=false,braking=false,auto=false,night=false,mode='follow',score=0,visited=new Set(),dwell=0,clockPrev=0,camRot=-.5,camElev=.50,camDist=200,needsMissionUpdate=true;
const toast=(str)=>{const el=$('toast');el.textContent=str;el.style.display='block';clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.style.display='none',2800);}
function nextStation(){return stations.find(s=>!visited.has(s.idx)&&s.z>trainZ-35) || stations[stations.length-1];}
const header=()=>{const nxt=nextStation(),dist=Math.max(0,Math.round(nxt.z-trainZ));$('nextBn').textContent=nxt.bn;$('nextEn').textContent=nxt.en;$('distance').textContent=dist+' m ahead · '+(nxt.idx+1)+'/16';$('progress').style.width=(100*Math.min(1,Math.max(0,1-dist/420)))+'%';};
function stationStop(){for(const s of stations){if(!visited.has(s.idx)&&Math.abs(trainZ-s.z)<17&&speed<3){visited.add(s.idx);score+=100;$('mission').textContent='স্টেশন সফল: '+visited.size+' / 16 · '+score+' পয়েন্ট';toast('✅ '+s.bn+' — STOP COMPLETE +100');dwell=3.6;return true;}}return false;}
function setCamera(m){mode=m;document.querySelectorAll('[data-camera]').forEach(b=>b.classList.toggle('on',b.dataset.camera===m));}
document.querySelectorAll('[data-camera]').forEach(b=>b.onclick=()=>setCamera(b.dataset.camera));
$('jumpbtn').onclick=()=>{const idx=Number($('jump').value);trainZ=stations[idx].z-230;speed=0;auto=false;visited.clear();score=0;dwell=0;$('mission').textContent='স্টেশনে ঠিকমতো ট্রেন থামাও · 0 / 16 স্টপ · 0 পয়েন্ট';$('auto').textContent='▶ Auto drive';$('auto').classList.remove('on');toast(stations[idx].bn+' এলাকার গেম প্রিভিউ');setCamera('follow');};
$('auto').onclick=()=>{auto=!auto;throttle=false;braking=false;$('auto').textContent=auto?'⏸ Auto ON':'▶ Auto drive';$('auto').classList.toggle('on',auto);$('status').textContent=auto?'AUTO PILOT / SIMULATED':'MANUAL DRIVE';};
$('night').onclick=()=>{night=!night;scene.background=new THREE.Color(night?'#102030':'#8ebbd0');scene.fog.color.copy(scene.background);ambient.intensity=night?.68:2.05;sun.intensity=night?.43:2.45;renderer.toneMappingExposure=night?.94:1.38;$('night').textContent=night?'🌙 Night':'☀️ Day';};
let ac;function horn(){try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();let os=ac.createOscillator(),g=ac.createGain();os.type='sawtooth';os.frequency.setValueAtTime(340,ac.currentTime);os.frequency.linearRampToValueAtTime(390,ac.currentTime+.13);g.gain.setValueAtTime(.0001,ac.currentTime);g.gain.exponentialRampToValueAtTime(.09,ac.currentTime+.03);g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+.55);os.connect(g);g.connect(ac.destination);os.start();os.stop(ac.currentTime+.56);}catch(e){}}
$('horn').onclick=horn;
function pedal(id,key){const el=$(id);const update=(v)=>{if(key==='power')throttle=v;else braking=v;el.classList.toggle('held',v);if(v&&auto){auto=false;$('auto').textContent='▶ Auto drive';$('auto').classList.remove('on');$('status').textContent='MANUAL DRIVE';}};
el.addEventListener('pointerdown',e=>{e.preventDefault();try{el.setPointerCapture(e.pointerId);}catch{}update(true)});['pointerup','pointercancel','lostpointercapture'].forEach(ev=>el.addEventListener(ev,()=>update(false)));}
pedal('power','power');pedal('brake','brake');
const keys=new Set();window.addEventListener('keydown',e=>{if(['Space','ArrowUp','ArrowDown','KeyW','KeyS','KeyH'].includes(e.code))e.preventDefault();keys.add(e.code);if(e.code==='KeyH'&&!e.repeat)horn();if(['KeyW','ArrowUp','KeyS','ArrowDown','Space'].includes(e.code)&&auto){auto=false;$('auto').textContent='▶ Auto drive';$('status').textContent='MANUAL DRIVE';$('auto').classList.remove('on');}});window.addEventListener('keyup',e=>keys.delete(e.code));
let pointer=null,pinch=0;const can=renderer.domElement;can.addEventListener('pointerdown',e=>{if(mode!=='orbit')setCamera('orbit');pointer=[e.clientX,e.clientY];can.setPointerCapture(e.pointerId)});can.addEventListener('pointermove',e=>{if(!pointer)return;camRot-=(e.clientX-pointer[0])*.007;camElev=Math.max(.1,Math.min(1.45,camElev+(e.clientY-pointer[1])*.005));pointer=[e.clientX,e.clientY]});can.addEventListener('pointerup',()=>pointer=null);can.addEventListener('pointercancel',()=>pointer=null);can.addEventListener('wheel',e=>{e.preventDefault();camDist=Math.min(500,Math.max(45,camDist*Math.exp(e.deltaY*.001)))},{passive:false});can.addEventListener('touchmove',e=>{if(e.touches.length===2){e.preventDefault();const a=e.touches[0],b=e.touches[1],n=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);if(pinch)camDist=Math.max(45,Math.min(500,camDist*pinch/n));pinch=n;}},{passive:false});can.addEventListener('touchend',e=>{if(e.touches.length<2)pinch=0});
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));});
$('loading').style.display='none';toast('🚇 ACCELERATE চাপ দিয়ে ট্রেন চালাও');
const v=new THREE.Vector3(),look=new THREE.Vector3();
function frame(t){requestAnimationFrame(frame);const dt=Math.min(.05,(t-(clockPrev||t))/1000);clockPrev=t;
if(auto){const nxt=nextStation(),dist=nxt.z-trainZ;let target=58;if(dist<160)target=Math.min(58,Math.max(0,Math.sqrt(Math.max(0,dist-11)*4.5)*3.6));if(dist<13)target=0;if(dwell>0){target=0;dwell-=dt;}const targetMS=target/3.6,cur=speed/3.6,step=cur<targetMS?1.08:-3.3;speed=Math.max(0,Math.min(85,(cur+Math.sign(targetMS-cur)*Math.min(Math.abs(targetMS-cur),Math.abs(step)*dt))*3.6));}else{const powering=throttle||keys.has('KeyW')||keys.has('ArrowUp'),stopping=braking||keys.has('KeyS')||keys.has('ArrowDown')||keys.has('Space');const acc=stopping?-3.3:powering?1.1:-.11;speed=Math.max(0,Math.min(90,speed+acc*dt*3.6));}
trainZ+=speed/3.6*dt;train.position.set(0,0,trainZ);if(speed<3&&dwell<=0)stationStop();
for(const g of districts){g.visible=Math.abs(g.position.z-trainZ)<850;}
for(const car of traffic){let z=car.position.z+(car.userData.side<0?1:-1)*car.userData.speed*dt;if(z>length+160)z=-350;if(z< -350)z=length+160;car.position.z=z;car.visible=Math.abs(z-trainZ)<700;}
if(mode==='cab'){v.set(0,26.1,trainZ+54);look.set(0,25.4,trainZ+235);}else if(mode==='map'){v.set(1,215,trainZ+15);look.set(0,20,trainZ+15);}else if(mode==='follow'){v.set(72,62,trainZ-125);look.set(0,23,trainZ+45);}else{const a=camDist*Math.cos(camElev);v.set(a*Math.sin(camRot),23+camDist*Math.sin(camElev),trainZ+a*Math.cos(camRot));look.set(0,22,trainZ);}
camera.position.lerp(v,Math.min(1,dt*4.5+.015));camera.lookAt(look);
$('speed').textContent=Math.round(speed);$('speednote').textContent=speed>80?'⚠️ OVER SPEED':'LIMIT 80 km/h';$('speednote').style.color=speed>80?'#ffb7a6':'#6ce9cb';
if((Math.floor(t/250)!==Math.floor((t-dt*1000)/250)))header();
renderer.render(scene,camera);}
requestAnimationFrame(frame);
