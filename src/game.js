import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ASSETS, MISSIONS } from './asset-manifest.js';
import { installRealism } from './realism.js';
import { createCharacterMotion } from './character-motion.js';
import { decorateVillage } from './village-detail.js';
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js';

// Pagla v3 — real-time Three.js village. Progressive GLB assets are CC0; native
// low-poly stand-ins remain visible if a model CDN request fails / is offline.
const $ = (id) => document.getElementById(id);
const mobile = matchMedia('(pointer:coarse)').matches;
const canvas = $('game');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({canvas,antialias:!mobile,powerPreference:'high-performance',alpha:false});
} catch (err) {
  $('fail').style.display = 'flex';
  $('failMsg').textContent = `3D renderer পাওয়া যায়নি (${err.message}). Safari/Chrome আপডেট করো অথবা আগের সংস্করণ চালাও।`;
  throw err;
}
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.31;
renderer.setClearColor(0xb1cfca,1);
renderer.shadowMap.enabled = !mobile;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xb8d8dc);
scene.fog = new THREE.FogExp2(0xb3c5b0,0.0070);
const camera = new THREE.PerspectiveCamera(67,1,.1,290);
const sun = new THREE.DirectionalLight(0xffecc4,2.1);
sun.position.set(-85,113,-42);
sun.castShadow = !mobile;
sun.shadow.mapSize.set(1024,1024);
sun.shadow.camera.left = -85;sun.shadow.camera.right = 85;sun.shadow.camera.top = 85;sun.shadow.camera.bottom = -85;
sun.shadow.bias = -0.0005;
scene.add(sun);
scene.add(new THREE.HemisphereLight(0xcbe6f8,0x5b6840,2.15));
const ambient = new THREE.AmbientLight(0xd5decc,.24);scene.add(ambient);

const mats = {};
const mat = (name,hex,roughness=1,extra={}) => mats[name] ||= new THREE.MeshStandardMaterial({color:hex,roughness,...extra});
const soil = mat('soil',0x926b4d), grass = mat('grass',0x47753d), paddy=mat('paddy',0x6fa451), reed=mat('reed',0x91ad47,1,{side:THREE.DoubleSide}), water=mat('water',0x4a8b90,.19,{metalness:.1,transparent:true,opacity:.88});
const timber=mat('timber',0x65503b), pale=mat('pale',0xc7af8b), brick=mat('brick',0x995c49), tin=mat('tin',0x7c8582,.48,{metalness:.36,side:THREE.DoubleSide}), rust=mat('rust',0x8d5949,.75,{metalness:.12}), green=mat('deepgreen',0x264f33), dark=mat('dark',0x182c27);
const roadX = (z) => Math.sin(z*.029)*4 + Math.sin(z*.062)*2;
function seeded(seed){return()=>{seed|=0;seed=(seed+0x6d2b79f5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296;};}
const rand = seeded(20261103),rnd=(a,b)=>a+(b-a)*rand();
function makeNoiseTexture(base,spread){
  const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');
  x.fillStyle=base;x.fillRect(0,0,256,256);
  for(let i=0;i<18000;i++){const k=Math.floor(rnd(0,255)),alpha=rnd(.02,.16);x.fillStyle=`rgba(${k},${k*.83|0},${k*.48|0},${alpha})`;x.fillRect(rand()*256,rand()*256,rnd(.2,4),rnd(.2,4));}
  for(let i=0;i<900;i++){x.fillStyle=i%3===0?'#8d694260':'#d7c38c27';x.fillRect(rand()*256,rand()*256,rnd(1,6),rnd(.2,2));}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),4);t.repeat.set(spread,spread);return t;
}
const dirtTexture=makeNoiseTexture('#80603e',7), grassTexture=makeNoiseTexture('#456f38',35);
const dirtMat=new THREE.MeshStandardMaterial({map:dirtTexture,color:0xdab890,roughness:1,side:THREE.DoubleSide});
const grassMat=new THREE.MeshStandardMaterial({map:grassTexture,roughness:1});
function ground(){
  const g=new THREE.PlaneGeometry(420,420,1,1);g.rotateX(-Math.PI/2);
  const m=new THREE.Mesh(g,grassMat);m.position.y=-.16;m.receiveShadow=true;scene.add(m);
  // A curved dirt road with mapped UVs (not a long series of square tiles).
  const a=[],uv=[],idx=[];let v=0;
  for(let z=-182;z<=182;z+=2){const x=roadX(z),w=3.8+Math.sin(z*.06)*.27;for(let side of [-1,1]){a.push(x+side*w,.015+Math.sin(z*.13)*.012,z);uv.push(side===-1?0:1,(z+182)/7);}if(z>-182){idx.push(v-2,v,v-1,v-1,v,v+1); }v+=2;}
  const g2=new THREE.BufferGeometry();g2.setAttribute('position',new THREE.Float32BufferAttribute(a,3));g2.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g2.setIndex(idx);g2.computeVertexNormals();const road=new THREE.Mesh(g2,dirtMat);road.receiveShadow=true;scene.add(road);
  // Vertical wheel ruts and small damp highlights.
  const rut=mat('rut',0x735c44,.97,{transparent:true,opacity:.62});
  const wet=mat('wet',0x6a7770,.2,{transparent:true,opacity:.68,metalness:.13});
  for(let z=-170;z<170;z+=2.5){for(let side of [-1.35,1.35]){
    const s=new THREE.Mesh(new THREE.PlaneGeometry(.18,2.8),rut);s.rotation.x=-Math.PI/2;s.position.set(roadX(z)+side,.04,z);scene.add(s);
  }}
  for(let i=0;i<46;i++){
    let z=rnd(-145,148),x=roadX(z)+rnd(-2.2,2.2);
    const p=new THREE.Mesh(new THREE.CircleGeometry(rnd(.3,.9),8),wet);p.rotation.x=-Math.PI/2;p.scale.y=rnd(.45,1.4);p.position.set(x,.047,z);scene.add(p);
  }
}
function cube(parent,w,h,d,material,x=0,y=0,z=0){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);parent.add(m);return m;}
// Natural clustered foliage. Shared geometry + instancing keeps draw calls low
// even on iPhone Safari; no more single faceted football-shaped tree crowns.
const forestTrunks=new THREE.InstancedMesh(
  new THREE.CylinderGeometry(.68,1,1,9,1),
  new THREE.MeshStandardMaterial({color:0x69503d,roughness:1}),140);
const forestCanopy=new THREE.InstancedMesh(
  new THREE.SphereGeometry(1,9,7),
  new THREE.MeshStandardMaterial({color:0xffffff,roughness:.99,side:THREE.DoubleSide}),1250);
const forestBranches=new THREE.InstancedMesh(
  new THREE.CylinderGeometry(.42,.7,1,6,1),
  new THREE.MeshStandardMaterial({color:0x62503b,roughness:.98}),330);
const forestDummy=new THREE.Object3D(), forestColor=new THREE.Color();
let trunkNum=0,leafNum=0,branchNum=0;
forestTrunks.frustumCulled=forestCanopy.frustumCulled=forestBranches.frustumCulled=false;
scene.add(forestTrunks,forestCanopy,forestBranches);
function foliageBillboard(x,z,height=9){
  if(trunkNum>=forestTrunks.instanceMatrix.count||leafNum>forestCanopy.instanceMatrix.count-12)return;
  const baseHeight=height*.73;
  forestDummy.position.set(x,baseHeight*.5,z);
  forestDummy.rotation.set(0,rnd(0,Math.PI*2),0);
  forestDummy.scale.set(height*.045,baseHeight,height*.045);
  forestDummy.updateMatrix();forestTrunks.setMatrixAt(trunkNum++,forestDummy.matrix);
  for(let j=0;j<3&&branchNum<forestBranches.instanceMatrix.count;j++){
    const ang=(j/3)*Math.PI*2+rnd(-.35,.35);
    forestDummy.position.set(x+Math.cos(ang)*height*.13,height*.62,z+Math.sin(ang)*height*.13);
    forestDummy.rotation.set(Math.sin(ang)*.62,0,Math.cos(ang)*.6);
    forestDummy.scale.set(height*.02,height*.46,height*.02);
    forestDummy.updateMatrix();forestBranches.setMatrixAt(branchNum++,forestDummy.matrix);
  }
  for(let j=0;j<9&&leafNum<forestCanopy.instanceMatrix.count;j++){
    const a=j*Math.PI*2/9+rnd(-.4,.4),r=(j%3===0?.25:.34)*height;
    const dx=Math.cos(a)*r,dz=Math.sin(a)*r;
    forestDummy.position.set(x+dx,height*(.70+rnd(-.02,.15)),z+dz);
    forestDummy.rotation.set(rnd(-.3,.3),rnd(0,6.28),rnd(-.3,.3));
    forestDummy.scale.set(height*rnd(.17,.26),height*rnd(.17,.23),height*rnd(.17,.27));
    forestDummy.updateMatrix();forestCanopy.setMatrixAt(leafNum,forestDummy.matrix);
    forestColor.setHSL(.275+rnd(-.03,.03),.37+rnd(-.1,.1),.20+rnd(-.035,.07));
    forestCanopy.setColorAt(leafNum++,forestColor);
  }
}
function finishForest(){
  forestTrunks.count=trunkNum;forestCanopy.count=leafNum;forestBranches.count=branchNum;
  forestTrunks.instanceMatrix.needsUpdate=true;
  forestCanopy.instanceMatrix.needsUpdate=true;
  forestBranches.instanceMatrix.needsUpdate=true;
  if(forestCanopy.instanceColor)forestCanopy.instanceColor.needsUpdate=true;
}
function tinHouse(x,z,scale=1,yaw=0){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=yaw;g.scale.setScalar(scale);scene.add(g);
  cube(g,7.6,.27,6.6,mat('foundation',0x8d7a61),0,.12,0);
  const painted=rand()>.5?pale:mat('limewashed',0xc3bea4);
  cube(g,7,3.25,6.0,painted,0,1.9,0);
  for(let side of [-1,1]){
    cube(g,.07,2.7,2.25,brick,side*3.55,1.8,-1.3);
    cube(g,.075,1.1,1.42,dark,side*3.6,2.35,.5);
  }
  cube(g,1.45,2.48,.09,mat('door',0x503c2a),1.9,1.37,-3.03);
  cube(g,1.6,1.15,.12,dark,-1.65,2.28,-3.04);
  cube(g,.08,1.15,.15,pale,-1.65,2.28,-3.15);
  const rt=4.15; // gabled, corrugated tin, two large planes plus raised ridges.
  for(let i=0;i<2;i++){
    const m = new THREE.Mesh(new THREE.PlaneGeometry(5.02,7.12),i?rust:tin);
    m.rotation.set(-Math.PI/2,(Math.PI/2)*(i?1:-1),i?.51:-.51);
    // roof panels built as actual sloped quads (correct outward normals).
  }
  const left=new THREE.BufferGeometry();const verts=[-4,3.52,-3.55, 0,rt,-3.55, -4,3.52,3.55, 0,rt,-3.55, 0,rt,3.55, -4,3.52,3.55];
  left.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));left.computeVertexNormals();g.add(new THREE.Mesh(left,tin));
  const right=new THREE.BufferGeometry();right.setAttribute('position',new THREE.Float32BufferAttribute([0,rt,-3.55,4,3.52,-3.55,0,rt,3.55,4,3.52,-3.55,4,3.52,3.55,0,rt,3.55],3));right.computeVertexNormals();g.add(new THREE.Mesh(right,rust));
  const rib=mat('roofrib',0xa4a8a3,.52,{metalness:.45});
  for(let j=-3.35;j<3.45;j+=.36){for(let s of [-1,1]){
    const yy=3.52;const xx=s*2; const stripe=cube(g,.046,.028,7.02,rib,xx,(rt+yy)/2,j); // simple horizontal reflective ribs
    stripe.rotation.z=s*.157;stripe.position.set(xx,(rt+yy)/2,j);
  }}
  cube(g,8,.12,.1,timber,0,4.17,-3.54);
  return g;
}
function pond(x,z,w=18,d=19){
  const border=new THREE.Mesh(new THREE.PlaneGeometry(w+2,d+2),soil);border.rotation.x=-Math.PI/2;border.position.set(x,-.018,z);scene.add(border);
  const plane=new THREE.Mesh(new THREE.PlaneGeometry(w,d,20,20),water);plane.rotation.x=-Math.PI/2;plane.position.set(x,.019,z);scene.add(plane);
  for(let i=0;i<42;i++){let px=x+rnd(-w/2,w/2),pz=z+rnd(-d/2,d/2);const lily=new THREE.Mesh(new THREE.CircleGeometry(rnd(.16,.42),8),mat('lily',0x4e915b,1,{side:THREE.DoubleSide}));lily.rotation.x=-Math.PI/2;lily.position.set(px,.041,pz);scene.add(lily);}
  for(let i=0;i<110;i++){const side=rand()>.5?1:-1,px=x+side*rnd(w/2,w/2+1.7),pz=z+rnd(-d/2,d/2);const m=new THREE.Mesh(new THREE.ConeGeometry(.085,rnd(.65,1.3),3),reed);m.position.set(px,.38,pz);m.rotation.z=rnd(-.3,.3);scene.add(m);}
}
function field(x,z,w,d){
  const f=new THREE.Mesh(new THREE.PlaneGeometry(w,d),rand()>.55?paddy:mat('field2',0x8ea85e));f.rotation.x=-Math.PI/2;f.position.set(x,-.02,z);scene.add(f);
}
function bambooFence(x,z,length,axis='x'){
  const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
  const n=Math.ceil(length/1.35);
  for(let k=0;k<=n;k++){
    const offset=(k/n-.5)*length;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(.054,.073,1.7,5),timber);post.position.set(axis==='x'?offset:0,.85,axis==='z'?offset:0);g.add(post);
  }
  for(let h of [.55,1.14]){
    const rail=new THREE.Mesh(new THREE.CylinderGeometry(.04,.045,length,5),timber);rail.position.y=h;rail.rotation.set(axis==='x'?0:Math.PI/2,0,axis==='x'?Math.PI/2:0);g.add(rail);
  }
}
function createRice(){
  // Instanced 3D bundles with real geometry; no photo planes / not a billboard texture.
  const geometry=new THREE.BufferGeometry();
  const verts=[],indices=[];let n=0;
  for(let blade=0;blade<5;blade++){
    const angle=blade*Math.PI*2/5,up=.45+(blade%3)*.06;
    const dx=Math.sin(angle)*.18,dz=Math.cos(angle)*.18;
    verts.push(-dx*.22,0,-dz*.22,dx*.2,up,dz*.2,dx,up*.42,dz);
    indices.push(n,n+1,n+2);n+=3;
  }
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geometry.setIndex(indices);geometry.computeVertexNormals();
  const clump=new THREE.InstancedMesh(geometry,new THREE.MeshStandardMaterial({color:0x80a84e,side:THREE.DoubleSide,roughness:1}),mobile?2700:5100);
  const obj=new THREE.Object3D();let count=0;
  for(let i=0;i<clump.count;i++){
    let x=rnd(-85,85),z=rnd(-148,145);
    if(Math.abs(x-roadX(z))<10 || Math.hypot(x-24,z+58)<21 || (z>-105&&z<-76&&x>-38&&x<2)||Math.abs(x)>72 && rand()>.3){continue;}
    obj.position.set(x,-.005,z);obj.rotation.y=rnd(0,6.28);obj.scale.setScalar(rnd(.66,1.08));obj.updateMatrix();clump.setMatrixAt(count++,obj.matrix);
  }
  clump.count=count;clump.instanceMatrix.needsUpdate=true;clump.frustumCulled=false;scene.add(clump);
}
function setupVillage(){
  ground();
  for(let row=-125;row<145;row+=26)for(let side of [-1,1])for(let n=1;n<=3;n++){
    const x=roadX(row)+side*(13+n*17);if(Math.hypot(x-24,row+58)<20)continue;
    field(x,row+8,13.5,20);
  }
  pond(24,-58,17,19);
  for(const [x,z,s,y] of [[19,-29,1,.2],[-17,-31,.9,-.1],[13,-65,.9,.38],[-22,-65,1,0],[18,-104,1.1,.17],[-15,-119,1,.12],[28,31,.82,.2],[-20,43,.92,-.2],[26,91,1.05,.4],[-23,103,.9,-.3]])tinHouse(x,z,s,y);
  bambooFence(12,-13,31,'z');bambooFence(-13,-28,22,'z');bambooFence(13,-82,21,'z');bambooFence(14,43,22,'z');
  const shop=new THREE.Group();shop.position.set(-17,0,-91);scene.add(shop);
  cube(shop,9,.24,6,soil,0,.14,0);cube(shop,8,3,4.3,pale,0,1.66,1.2);cube(shop,8.9,.22,6.2,rust,0,3.22,0);
  cube(shop,8.4,.7,.1,mat('sign',0x9a382e),0,3.08,-3.15);cube(shop,5.7,1.0,.09,timber,0,1.1,-3.12);
  for(const [x,z] of [[-93,-18],[85,-40],[-94,62],[88,103]])for(let i=0;i<10;i++)foliageBillboard(x+rnd(-20,20),z+rnd(-12,12),rnd(7,12));
  for(let i=0;i<40;i++){
    const z=rnd(-145,145),side=rand()>.5?1:-1,x=roadX(z)+side*rnd(15,37);
    if(Math.hypot(x-24,z+58)>20)foliageBillboard(x,z,rnd(6,11));
  }
  // Telephone poles and wires: slim meshes for believable rural roadside.
  const power=new THREE.Group();scene.add(power);
  const poles=[];
  for(let z=-138;z<=130;z+=31){const x=roadX(z)+7.4;const p=new THREE.Mesh(new THREE.CylinderGeometry(.14,.19,9,8),mat('pole',0x8c8275));p.position.set(x,4.5,z);power.add(p);cube(power,2,.17,.18,timber,x,8.4,z);poles.push([x,z]);}
  const cableMaterial=new THREE.LineBasicMaterial({color:0x353b36,transparent:true,opacity:.85});
  for(let j=1;j<poles.length;j++)for(let span of [-.55,.55]){
    const [x,z]=poles[j-1],[xx,zz]=poles[j];const points=[];
    for(let k=0;k<=10;k++){const t=k/10;points.push(new THREE.Vector3(THREE.MathUtils.lerp(x,xx,t),8.4-.8*Math.sin(Math.PI*t),THREE.MathUtils.lerp(z+span,zz+span,t)));}
    power.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),cableMaterial));
  }
  createRice();
  finishForest();
}
setupVillage();
const villageDetails=decorateVillage(scene,{mobile});
const realism=installRealism({scene,renderer,sun,mobile,roadX,materials:{dirtMat,grassMat,tin,rust,brick}});

const collisions=[{x:19,z:-29,w:9,d:8},{x:-17,z:-31,w:8,d:7},{x:13,z:-65,w:8,d:7},{x:-22,z:-65,w:9,d:7},{x:18,z:-104,w:10,d:7},{x:-15,z:-119,w:9,d:7},{x:28,z:31,w:8,d:7},{x:-20,z:43,w:9,d:7},{x:26,z:91,w:10,d:7},{x:-23,z:103,w:9,d:7},{x:-17,z:-91,w:9,d:6}];
function blocked(x,z){if(Math.abs(x)>173||Math.abs(z)>170)return true;
  if(x>15&&x<33&&z>-69&&z<-47)return true;
  return collisions.some(b=>Math.abs(x-b.x)<b.w*.54&&Math.abs(z-b.z)<b.d*.55);
}

// Character rig: animated joints and visible head, clothing and limbs, not a capsule.
function makeAvatar(){
  const g=new THREE.Group();const sk=mat('skin',0xb88a69,.92),shirt=mat('shirt',0x2a383a),jeans=mat('jeans',0x455465),hair=mat('hair',0x161718),boots=mat('boots',0x292b26);
  const torso=cube(g,.74,.82,.33,shirt,0,1.31,0);
  const neck=new THREE.Mesh(new THREE.CylinderGeometry(.112,.118,.19,10),sk);neck.position.set(0,1.82,0);g.add(neck);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.205,12,10),sk);head.position.set(0,2.02,-.012);head.scale.set(1,.98,.88);g.add(head);
  const scalp=new THREE.Mesh(new THREE.SphereGeometry(.217,12,9),hair);scalp.position.set(0,2.125,-.012);scalp.scale.set(1,.50,.94);g.add(scalp);
  const bag=cube(g,.58,.7,.19,mat('bag',0x4d4a3a),0,1.3,.27);bag.rotation.x=.04;
  for(let s of [-1,1])cube(g,.07,.7,.03,mat('strap',0x716950),s*.22,1.35,-.20);
  const limbs=[];
  for(let side of [-1,1]){
    const arm=new THREE.Group();arm.position.set(side*.44,1.68,0);g.add(arm);
    cube(arm,.225,.56,.25,shirt,0,-.28,0);cube(arm,.16,.30,.17,sk,0,-.7,0);limbs.push({arm,side});
    const leg=new THREE.Group();leg.position.set(side*.19,1,0);g.add(leg);
    cube(leg,.28,.85,.32,jeans,0,-.40,0);cube(leg,.28,.15,.47,boots,0,-.88,-.07);limbs[limbs.length-1].leg=leg;
  }
  return {root:g,limbs};
}
const person=makeAvatar();scene.add(person.root);
const player={x:roadX(12),z:12,angle:0,speed:0,riding:false};
const carPark={x:roadX(3)+4.8,z:3};
const carRoot=new THREE.Group();scene.add(carRoot);carRoot.position.set(carPark.x,0,carPark.z);
const cngRoot=new THREE.Group();cngRoot.rotation.y=Math.PI;carRoot.add(cngRoot);
const fallbackCng=new THREE.Group();cngRoot.add(fallbackCng);
cube(fallbackCng,1.6,.7,2.35,mat('cngbody',0x167158),0,.6,0);
cube(fallbackCng,1.72,.2,2.2,dark,0,2.1,0);
cube(fallbackCng,1.55,1.2,.07,mat('windscreen',0x91babc,.34,{transparent:true,opacity:.82}),0,1.4,1.12);
for(let s of [-1,1]){const wh=new THREE.Mesh(new THREE.TorusGeometry(.32,.09,7,12),dark);wh.position.set(s*.78,.38,-.55);wh.rotation.y=Math.PI/2;fallbackCng.add(wh);}
const motoFallback=new THREE.Group();scene.add(motoFallback);motoFallback.position.set(6,0,18);
cube(motoFallback,.7,.43,1.25,mat('motorbody',0x275e53),0,.78,0);cube(motoFallback,.66,.18,.76,dark,0,1.05,.24);
for(const z of [-.66,.7]){const wh=new THREE.Mesh(new THREE.TorusGeometry(.32,.07,7,12),dark);wh.position.set(0,.39,z);wh.rotation.y=Math.PI/2;motoFallback.add(wh);}

const loader=new GLTFLoader();
const assetsLoaded=new Set(),assetsFailed=new Set(),assetRoots={};
let pending=Object.keys(ASSETS).length;
function progress(){
  const total=Object.keys(ASSETS).length;
  $('assetInfo').textContent=`3D মডেল: ${assetsLoaded.size}/${total} লোড হয়েছে${assetsFailed.size?` · ${assetsFailed.size}টি fallback`:''}`;
  $('status').textContent=`GLB ${assetsLoaded.size}/${total}${assetsFailed.size?` · ${assetsFailed.size} fallback`:''}`;
}
function deployModel(key,root){
  const copy = (x,z,yaw=0,scale=1) => {const g=root.clone(true);g.position.set(x,0,z);g.rotation.y=yaw;g.scale.setScalar(scale);scene.add(g);return g;};
  switch(key){
    case 'banana': for(const [x,z,s] of [[14,0,1],[24,2,1.07],[-16,-20,1.12],[34,-35,1.18],[-32,-51,1.1],[34,-83,1.0],[12,-111,1.2],[-25,50,1],[-24,93,1.1]])copy(x,z,rnd(0,6),s);break;
    case 'bamboo':for(const [x,z,s] of [[-30,-18,1.6],[38,-53,1.4],[45,-82,1.55],[-31,-101,1.8],[30,62,1.65],[42,103,1.4]])copy(x,z,rnd(0,6),s);break;
    case 'tea':copy(-17.6,-92.1,Math.PI,1);break;
    case 'charpoy':copy(-22.5,-93,Math.PI/2,1);copy(-13.5,-93,Math.PI/2,1);break;
    case 'bicycle':copy(-12,-87,-.2,1);copy(27,23,1.3,1);break;
    case 'motorcycle':copy(6,18,.6,1);motoFallback.visible=false;break;
    case 'cng':cngRoot.add(root);fallbackCng.visible=false;break;
    case 'cow': copy(11,-44,.75,.94);copy(-11,49,2.4,.86);break;
    case 'jersey':copy(10,-73,1.7,.93);break;
    case 'goat':copy(22,-16,.6,1);copy(-24,98,2.4,.86);break;
    case 'shrubs': for(const [x,z,scale] of [[8,-14,1],[11,-42,1.18],[-10,-46,.9],[30,-67,1.13],[-27,-72,1.2],[12,-97,.88],[-15,20,1.02],[11,61,.93],[16,96,1.12]])copy(x,z,rnd(0,6.28),scale);break;
    case 'palm':for(const [x,z,scale] of [[-31,-14,2.5],[38,-29,2.4],[-29,-71,3.2],[34,-106,3.6],[30,58,3],[-32,110,2.8]])copy(x,z,rnd(0,6.28),scale);break;
    case 'hay':copy(31,-30,.5,.92);copy(-30,50,1.1,1);break;
    case 'waterTrough':copy(13,-44,-.4,1);break;
    case 'milkChurns':copy(-15.9,-94.4,-.5,1);break;
    case 'wheelbarrow':copy(-13,-80,.3,1);break;
  }
}
for(const [key,entry] of Object.entries(ASSETS)){
  loader.load(entry.url,gltf=>{
    const root=gltf.scene;
    root.traverse(obj=>{if(obj.isMesh){obj.castShadow=false;obj.receiveShadow=false;obj.frustumCulled=true;}});
    assetRoots[key]=gltf;
    deployModel(key,root);
    assetsLoaded.add(key);pending--;progress();
  },undefined,error=>{console.warn('Pagla GLB fallback:',key,error);assetsFailed.add(key);pending--;progress();});
}
progress();

// Higher-detail CC0 skinned hero with plaid shirt + Walk / Run animations.
// Remote download may fail (network/CORS); the original animated mesh
// remains a playable fallback, so character loading is never blocking.
let heroModel=null,heroMotion=null,heroYOffset=0;
loader.load('https://vibeassets.io/download/zpepqtthci?combined=1',gltf=>{
  const mesh=gltf.scene;
  const bounds=new THREE.Box3().setFromObject(mesh);
  const dimensions=bounds.getSize(new THREE.Vector3());
  const targetHeight=1.83;
  mesh.scale.setScalar(Math.min(8,Math.max(.08,targetHeight/Math.max(.02,dimensions.y))));
  bounds.setFromObject(mesh);
  heroYOffset=-bounds.min.y;
  mesh.traverse(child=>{
    if(child.isMesh){child.castShadow=!mobile;child.receiveShadow=true;}
  });
  mesh.position.set(player.x,heroYOffset,player.z);
  heroMotion=createCharacterMotion(mesh,gltf.animations || []);
  // Prefer the reliable procedural walker over a frozen skinned T-pose.
  if (heroMotion.boneCount < 8 || (!heroMotion.hasArms && !heroMotion.usableClips.length)) {
    console.warn('Hero has no usable humanoid rig; keeping animated fallback');
    return;
  }
  scene.add(mesh);heroModel=mesh;
  $('status').textContent='3D hero animated · '+heroMotion.usableClips.join('/')+' · '+assetsLoaded.size+' props';
},undefined,error=>{console.warn('Photoreal character CDN unavailable; using playable fallback',error);});

// Two mission-giving villagers. The model is a CC0 rigged humanoid and
// loads progressively, so the quest works even with a poor 4G connection.
const npcPositions=[{x:11,z:-25.8,rotation:1.7},{x:-10,z:-86.6,rotation:2.6}];
const villagerNPCs=[];
for(const p of npcPositions){
  const fallback=makeAvatar();
  fallback.root.position.set(p.x,0,p.z);
  fallback.root.rotation.y=p.rotation;
  scene.add(fallback.root);
  villagerNPCs.push({position:p, fallback:fallback.root, group:null,motion:null,offset:0});
}
loader.load('https://vibeassets.io/download/grzp782xf7?combined=1', gltf=>{
  for(const npc of villagerNPCs){
    const mesh=cloneSkinned(gltf.scene);
    const box=new THREE.Box3().setFromObject(mesh);
    const dim=box.getSize(new THREE.Vector3());
    mesh.scale.setScalar(1.78/Math.max(.5,dim.y));
    box.setFromObject(mesh);
    npc.offset=-box.min.y;
    mesh.position.set(npc.position.x,npc.offset,npc.position.z);
    mesh.rotation.y=npc.position.rotation;
    mesh.traverse(obj=>{if(obj.isMesh){obj.castShadow=!mobile;obj.receiveShadow=true;}});
    scene.add(mesh);
    npc.group=mesh;
    npc.motion=createCharacterMotion(mesh,gltf.animations||[]);
    if(npc.motion.boneCount<8){npc.group.visible=false;npc.group=null;continue;}
    npc.fallback.visible=false;
  }
},undefined,error=>console.warn('Mission NPC GLB failed: using original villagers',error));

const joystick=$('joystick'),stick=$('stick'),run=$('run'),interact=$('interact');
let joyPointer=null,mousePointer=null,runHeld=false,camYaw=.22,camPitch=.22,playing=false,mission=0,camView=0,toastTimer;
const input={x:0,y:0},keys=new Set();
function toast(t){const el=$('toast');el.textContent=t;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2600);}
const resetJoy=()=>{joyPointer=null;input.x=input.y=0;stick.style.transform='translate(0px,0px)';};
const joyMove=e=>{const r=joystick.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,reach=(r.width-45)/2;let x=(e.clientX-cx)/reach,y=(e.clientY-cy)/reach,l=Math.max(1,Math.hypot(x,y));input.x=x/l;input.y=y/l;stick.style.transform=`translate(${input.x*reach*.72}px,${input.y*reach*.72}px)`;};
joystick.addEventListener('pointerdown',e=>{e.preventDefault();joyPointer=e.pointerId;joystick.setPointerCapture(e.pointerId);joyMove(e);});
joystick.addEventListener('pointermove',e=>{if(e.pointerId===joyPointer)joyMove(e);});
for(const ev of ['pointerup','pointercancel','lostpointercapture'])joystick.addEventListener(ev,e=>{if(joyPointer===e.pointerId)resetJoy();});
canvas.addEventListener('pointerdown',e=>{mousePointer=e.pointerId;canvas.setPointerCapture(e.pointerId);canvas.dataset.x=e.clientX;canvas.dataset.y=e.clientY;});
canvas.addEventListener('pointermove',e=>{if(e.pointerId!==mousePointer)return;const dx=e.clientX-Number(canvas.dataset.x),dy=e.clientY-Number(canvas.dataset.y);canvas.dataset.x=e.clientX;canvas.dataset.y=e.clientY;camYaw-=dx*.0043;camPitch=THREE.MathUtils.clamp(camPitch+dy*.0026,.07,.68);});
for(const ev of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(ev,e=>{if(mousePointer===e.pointerId)mousePointer=null;});
for(const ev of ['pointerdown'])run.addEventListener(ev,e=>{e.preventDefault();runHeld=true;run.setPointerCapture(e.pointerId);});
for(const ev of ['pointerup','pointercancel','lostpointercapture'])run.addEventListener(ev,()=>runHeld=false);
$('camera').addEventListener('click',()=>{camView=(camView+1)%3;camPitch=camView===1?.36:.22;toast(['👀 সাধারণ ক্যামেরা','🎥 দূরের ক্যামেরা','📷 কাছের ক্যামেরা'][camView]);});
addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();keys.add(e.code);if(e.code==='KeyF'&&!e.repeat&&playing)act();});
addEventListener('keyup',e=>keys.delete(e.code));
addEventListener('blur',()=>{keys.clear();resetJoy();runHeld=false;});
document.addEventListener('visibilitychange',()=>{if(document.hidden){keys.clear();resetJoy();runHeld=false;}});
let taka=0;
const markerGroup=new THREE.Group();
const markerRing=new THREE.Mesh(new THREE.TorusGeometry(.94,.095,10,26),new THREE.MeshBasicMaterial({color:0xffce61}));
markerRing.rotation.x=-Math.PI/2;markerGroup.add(markerRing);
const markerDiamond=new THREE.Mesh(new THREE.OctahedronGeometry(.33),new THREE.MeshStandardMaterial({color:0xf8d56a,emissive:0x6a3800,emissiveIntensity:.55}));
markerDiamond.position.y=1.65;markerGroup.add(markerDiamond);scene.add(markerGroup);
const missionSatchel=new THREE.Group();
const satchelBody=new THREE.Mesh(new THREE.BoxGeometry(.48,.32,.14),new THREE.MeshStandardMaterial({color:0x80603e,roughness:.88}));
satchelBody.position.y=.24;missionSatchel.add(satchelBody);
const strap=new THREE.Mesh(new THREE.TorusGeometry(.24,.034,7,16,Math.PI),new THREE.MeshStandardMaterial({color:0x3f2e1a,roughness:.98}));
strap.position.y=.42;missionSatchel.add(strap);
missionSatchel.position.set(12,.03,-58);scene.add(missionSatchel);
const nearMission=()=>mission<MISSIONS.length&&!player.riding&&Math.hypot(player.x-MISSIONS[mission].x,player.z-MISSIONS[mission].z)<7;
function advanceQuest(){
  if(!nearMission())return false;
  const task=MISSIONS[mission];mission++;taka+=task.reward||0;
  toast(task.message+' · +৳'+task.reward);
  $('money').textContent='৳ '+taka.toLocaleString('en-US');
  if(mission<MISSIONS.length){
    $('mission').innerHTML='গ্রামের সমস্যা: <b>'+mission+'/৩ শেষ</b>';
    $('objective').textContent='📍 '+MISSIONS[mission].name;
  }else{
    $('mission').innerHTML='🎉 <b>গ্রামের সমস্যা সমাধান হয়েছে!</b>';
    $('objective').textContent='🏆 মিশন সম্পূর্ণ · ৳'+taka;
  }
  missionSatchel.visible=mission===1;
  return true;
}
function act(){
  if(advanceQuest())return;
  if(player.riding){
    player.riding=false;player.speed=0;
    carPark.x=player.x+Math.cos(player.angle)*3.8;
    carPark.z=player.z-Math.sin(player.angle)*3.8;
    toast('🛺 CNG থেকে নেমেছ');return;
  }
  if(Math.hypot(player.x-carPark.x,player.z-carPark.z)<6){
    player.riding=true;toast('🛺 CNG চালাতে joystick ব্যবহার করো');
  }else toast(mission<MISSIONS.length?'📍 মিশনের হলুদ চিহ্নের কাছে যাও':'CNG-এর কাছে গিয়ে ওঠো');
}
interact.addEventListener('click',act);
$('start').addEventListener('click',()=>{playing=true;$('splash').classList.add('hidden');toast('🇧🇩 গ্রামের সমস্যা: মেম্বারের সঙ্গে কথা বলো');});
if(new URLSearchParams(location.search).has('autoplay'))$('start').click();

let q=mobile?'low':'high',dpr=1;
const quality=()=>{const density=Math.min(devicePixelRatio||1,mobile?(q==='high'?1.5:1.08):(q==='high'?1.8:1.22));dpr=density;renderer.setPixelRatio(dpr);$('toggle').textContent=`⚙︎ GRAPHICS: ${q.toUpperCase()}`;sun.castShadow=q==='high';renderer.shadowMap.enabled=q==='high';realism.setQuality(q);resize();};
$('toggle').addEventListener('click',()=>{q=q==='high'?'low':'high';quality();toast(q==='high'?'✨ High quality':'⚡ Battery saver');});
function resize(){const width=innerWidth,height=innerHeight;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();}
quality();addEventListener('resize',resize,{passive:true});
const camAt=new THREE.Vector3(player.x,2.4,player.z+7),focus=new THREE.Vector3(),temp=new THREE.Vector3();
let elapsed=0,last=performance.now(),frameCounter=0,fpsValue=0,lowFrames=0;
function update(dt){
  elapsed+=dt;
  const kx=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0)+input.x;
  const kz=(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-(keys.has('KeyW')||keys.has('ArrowUp')?1:0)+input.y;
  const length=Math.hypot(kx,kz);
  if(playing&&length>.08){
    const x=kx/Math.max(1,length),z=kz/Math.max(1,length);
    const dx=Math.cos(camYaw)*x+Math.sin(camYaw)*z;
    const dz=-Math.sin(camYaw)*x+Math.cos(camYaw)*z;
    const targetSpeed=player.riding?11.5:((keys.has('ShiftLeft')||keys.has('ShiftRight')||runHeld)?7.2:4.2);
    const x2=player.x+dx*targetSpeed*dt,z2=player.z+dz*targetSpeed*dt;
    if(!blocked(x2,player.z))player.x=x2;
    if(!blocked(player.x,z2))player.z=z2;
    player.angle=Math.atan2(-dx,-dz);
    player.speed=targetSpeed;
  } else player.speed*=.75;
  for(const npc of villagerNPCs){
    if(!npc.group)continue;
    const toPlayer=Math.hypot(player.x-npc.position.x,player.z-npc.position.z);
    if(toPlayer<9)npc.group.rotation.y=Math.atan2(player.x-npc.position.x,player.z-npc.position.z);
    npc.motion.update(dt,0,elapsed,false);
  }
  person.root.visible=!player.riding&&!heroModel;
  if(heroModel){
    heroModel.visible=!player.riding;
    heroModel.position.set(player.x,heroYOffset,player.z);
    heroModel.rotation.y=player.angle;
    if(heroMotion)heroMotion.update(dt,player.speed,elapsed,player.riding);
  }
  if(!player.riding){
    person.root.position.set(player.x,Math.sin(elapsed*10)*Math.min(.024,player.speed*.004),player.z);person.root.rotation.y=player.angle;
    const gait=Math.min(.62,player.speed*.095);
    person.limbs.forEach(({arm,leg},i)=>{const stride=Math.sin(elapsed*8.5+i*Math.PI)*gait;arm.rotation.x=-stride*.85;leg.rotation.x=stride;});
  }
  carRoot.position.set(player.riding?player.x:carPark.x,0,player.riding?player.z:carPark.z);
  carRoot.rotation.y=player.riding?player.angle:0;
  const near=Math.hypot(player.x-carPark.x,player.z-carPark.z)<6;
  const targetNear=playing&&nearMission();
  interact.disabled=!playing||(!player.riding&&!near&&!targetNear);
  interact.innerHTML=player.riding?'<b>🚶</b>নামো':targetNear?'<b>✋</b>'+MISSIONS[mission].action:'<b>🛺</b>উঠো';
  markerGroup.visible=playing&&mission<MISSIONS.length;
  if(markerGroup.visible){const target=MISSIONS[mission];markerGroup.position.set(target.x,.04+Math.sin(elapsed*2)*.025,target.z);markerDiamond.rotation.y+=dt*.7;}
  missionSatchel.visible=playing&&mission===1;
  $('speed').textContent=(player.riding?'🛺 CNG':'🚶 হাঁটা')+` · ${Math.round(player.speed*3.6)} km/h`;
  const distance=(camView===1?11.2:camView===2?4.6:player.riding?8.8:6.8),height=player.riding?2:1.4;
  temp.set(player.x+Math.sin(camYaw)*distance*Math.cos(camPitch),height+distance*Math.sin(camPitch),player.z+Math.cos(camYaw)*distance*Math.cos(camPitch));
  camAt.lerp(temp,1-Math.exp(-dt*5.5));
  camera.position.copy(camAt);focus.set(player.x,height,player.z);camera.lookAt(focus);
}
function minimap(){
  const m=$('map'),c=m.getContext('2d'),w=m.width,h=m.height;const scale=1.7;
  c.fillStyle='#65924d';c.fillRect(0,0,w,h);
  c.fillStyle='#83ac64';for(let i=0;i<18;i++)c.fillRect((i*41)%w,(i*57)%h,29,33);
  const pos=(x,z)=>[w/2+(x-player.x)*scale,h/2+(z-player.z)*scale];
  c.lineCap='round';c.lineJoin='round';c.strokeStyle='#9f7e56';c.lineWidth=13;c.beginPath();for(let z=player.z-70;z<player.z+70;z+=1){let [x,y]=pos(roadX(z),z);if(z===player.z-70)c.moveTo(x,y);else c.lineTo(x,y);}c.stroke();
  c.fillStyle='#6dabc2';const [px,pz]=pos(24,-58);c.fillRect(px-14,pz-16,28,32);
  for(let i=0;i<MISSIONS.length;i++){let [x,y]=pos(MISSIONS[i].x,MISSIONS[i].z);c.fillStyle=i<mission?'#efffe0':'#fee579';c.beginPath();c.arc(x,y,i===mission?8:5,0,Math.PI*2);c.fill();}
  c.save();c.translate(w/2,h/2);c.rotate(-player.angle);c.fillStyle='#17352b';c.strokeStyle='#efffe4';c.lineWidth=3;c.beginPath();c.moveTo(0,-12);c.lineTo(9,9);c.lineTo(0,5);c.lineTo(-9,9);c.closePath();c.fill();c.stroke();c.restore();
}
function frame(now){
  const dt=Math.min(.05,Math.max(.002,(now-last)/1000));last=now;
  update(dt);realism.update(camera);renderer.render(scene,camera);frameCounter++;
  if(frameCounter%12===0){minimap();fpsValue=Math.round(1/dt);$('fps').textContent=`${fpsValue} FPS · ${assetsLoaded.size} GLB models`;
    if(playing&&mobile&&q==='high'&&fpsValue<24){if(++lowFrames>8){q='low';quality();toast('⚡ FPS উন্নত করতে graphics কমানো হয়েছে');}} else lowFrames=Math.max(0,lowFrames-2);
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
