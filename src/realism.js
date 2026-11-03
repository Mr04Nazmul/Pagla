import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';

// Pagla: cinematic outdoor rendering. Uses CC0 PBR maps and procedural fallback.
// This does not claim console-quality / photorealistic AAA graphics.
export function installRealism({scene,renderer,sun,mobile,roadX,materials}){
 const {dirtMat,grassMat,tin,rust,brick}=materials;
 const rng=(()=>{let n=62791;return()=>{n=(Math.imul(n,1664525)+1013904223)|0;return(n>>>0)/4294967296;};})();
 const rand=(a,b)=>a+(b-a)*rng();
 const aniso=Math.min(renderer.capabilities.getMaxAnisotropy(),4);
 function tex(image,rx=1,ry=1){image.wrapS=image.wrapT=THREE.RepeatWrapping;image.repeat.set(rx,ry);image.anisotropy=aniso;image.colorSpace=THREE.SRGBColorSpace;return image;}
 function procedural(kind){
  const size=512,canvas=document.createElement('canvas');canvas.width=canvas.height=size;
  const ctx=canvas.getContext('2d');
  const palette=kind==='soil'?'#76604b':kind==='grass'?'#496b39':kind==='roof'?'#7a7d7a':'#a3775d';
  ctx.fillStyle=palette;ctx.fillRect(0,0,size,size);
  if(kind==='roof'){
   for(let x=0;x<size;x++){const shade=Math.round(110+25*Math.sin(x*Math.PI*2/19));
    ctx.fillStyle='rgb('+shade+','+Math.round(shade*1.02)+','+Math.round(shade*1.02)+')';ctx.fillRect(x,0,1,size);
   }
  }else if(kind==='brick'){
   for(let y=0;y<size;y+=46){ctx.fillStyle='#c6b5a0';ctx.fillRect(0,y,size,3);
    for(let x=(Math.floor(y/46)%2?58:0);x<size;x+=117)ctx.fillRect(x,y,3,45);
   }
  }
  for(let i=0;i<14500;i++){
   const x=rng()*size,y=rng()*size,z=Math.floor(rand(60,160));
   const c=kind==='grass'?'rgba('+Math.floor(z*.50)+','+z+','+Math.floor(z*.38)+',.22)':
     kind==='roof'?'rgba(151,83,49,.15)':'rgba('+z+','+Math.floor(z*.78)+','+Math.floor(z*.52)+',.13)';
   ctx.fillStyle=c;
   ctx.fillRect(x,y,kind==='grass'?rand(.3,1.4):rand(.3,4),kind==='grass'?rand(1,7):rand(.3,5));
  }
  const result=tex(new THREE.CanvasTexture(canvas),kind==='grass'?24:1,kind==='soil'?10:1);
  return result;
 }
 const mud=procedural('soil'),meadow=procedural('grass'),roof=procedural('roof'),brickTex=procedural('brick');
 mud.repeat.set(1,1);
 dirtMat.map=mud;dirtMat.color.set(0xffffff);dirtMat.bumpMap=mud;dirtMat.bumpScale=.045;dirtMat.roughness=.9;dirtMat.needsUpdate=true;
 grassMat.map=meadow;grassMat.color.set(0xffffff);grassMat.bumpMap=meadow;grassMat.bumpScale=.02;grassMat.needsUpdate=true;
 for(const [material,rusty] of [[tin,false],[rust,true]]){
  material.map=roof;material.color.set(rusty?0xcb9983:0xd4d6d1);
  material.bumpMap=roof;material.bumpScale=.08;material.roughness=rusty?.79:.51;
  material.metalness=rusty?.1:.32;material.needsUpdate=true;
 }
 brick.map=brickTex;brick.color.set(0xffffff);brick.bumpMap=brickTex;brick.bumpScale=.03;brick.needsUpdate=true;
 // Existing manually modeled roof polygons have no UV attributes.
 scene.traverse(item=>{
  if(!item.isMesh||![tin,rust,brick].includes(item.material))return;
  const g=item.geometry,p=g&&g.getAttribute('position');
  if(!p||g.getAttribute('uv'))return;
  const uv=new Float32Array(p.count*2);
  for(let i=0;i<p.count;i++){uv[i*2]=p.getX(i)/8+.5;uv[i*2+1]=p.getZ(i)/8+.5;}
  g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 });
 // Photographed red mud from Poly Haven, CC0. Offline and blocked-CDN safe.
 const loader=new THREE.TextureLoader(),base='https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/';
 function mapFrom(url,material,prop,rx,ry,srgb=true){
  loader.load(url,image=>{tex(image,rx,ry);if(!srgb)image.colorSpace=THREE.NoColorSpace;material[prop]=image;material.needsUpdate=true;},
   undefined,()=>{});
 }
 mapFrom(base+'red_dirt_mud_01/red_dirt_mud_01_diff_1k.jpg',dirtMat,'map',1,1);
 mapFrom(base+'red_dirt_mud_01/red_dirt_mud_01_nor_gl_1k.jpg',dirtMat,'normalMap',1,1,false);
 mapFrom(base+'red_dirt_mud_01/red_dirt_mud_01_rough_1k.jpg',dirtMat,'roughnessMap',1,1,false);
 dirtMat.normalScale=new THREE.Vector2(.38,.38);
 mapFrom(base+'brick_wall_001/brick_wall_001_diffuse_1k.jpg',brick,'map',1,1);
 // Atmospheric scattering sky, soft late-afternoon sun.
 const sky=new Sky();sky.scale.setScalar(245);sky.frustumCulled=false;sky.renderOrder=-1000;
 sky.material.uniforms.turbidity.value=9.5;
 sky.material.uniforms.rayleigh.value=2.25;
 sky.material.uniforms.mieCoefficient.value=.005;
 sky.material.uniforms.mieDirectionalG.value=.78;
 const theta=THREE.MathUtils.degToRad(72),phi=THREE.MathUtils.degToRad(225);
 const dir=new THREE.Vector3().setFromSphericalCoords(1,theta,phi);
 sky.material.uniforms.sunPosition.value.copy(dir);
 sky.material.depthWrite=false;
 scene.add(sky);
 scene.background=null;scene.fog.color.set(0xabbcad);
 sun.color.set(0xffe0ae);sun.intensity=2.05;
 sun.position.copy(dir).multiplyScalar(120);
 renderer.toneMappingExposure=1.09;
 // Uneven wet puddles keep the road from looking like uniform flat tiles.
 const wetMat=new THREE.MeshPhysicalMaterial({color:0x647e79,roughness:.1,metalness:0,clearcoat:1,clearcoatRoughness:.07,transparent:true,opacity:.78,depthWrite:false,side:THREE.DoubleSide});
 const puddles=new THREE.Group();
 for(let i=0;i<24;i++){
  const z=rand(-130,132),x=roadX(z)+rand(-2.3,2.3);
  const shape=new THREE.Shape(),radius=rand(.3,1.08);
  for(let j=0;j<=20;j++){
   const a=j*Math.PI/10,r=radius*(.81+.15*Math.sin(j*2.13+i)+.09*Math.sin(j*3.3+i));
   if(j===0)shape.moveTo(r*Math.cos(a),r*.7*Math.sin(a));
   else shape.lineTo(r*Math.cos(a),r*.7*Math.sin(a));
  }
  const mesh=new THREE.Mesh(new THREE.ShapeGeometry(shape),wetMat);
  mesh.rotation.x=-Math.PI/2;mesh.position.set(x,.062,z);puddles.add(mesh);
 }
 scene.add(puddles);
 // Single InstancedMesh for roadside grass: draw-call friendly on phones.
 const geo=new THREE.BufferGeometry();
 geo.setAttribute('position',new THREE.Float32BufferAttribute([
  -.13,0,0, 0,.74,0, .13,0,0,
  0,0,-.11, 0,.62,0, 0,0,.11
 ],3));geo.computeVertexNormals();
 const blades=new THREE.InstancedMesh(geo,new THREE.MeshStandardMaterial({color:0x62884e,roughness:1,side:THREE.DoubleSide}),mobile?950:2000);
 const dummy=new THREE.Object3D();let count=0;
 for(let i=0;i<blades.count*4&&count<blades.count;i++){
  const x=rand(-76,76),z=rand(-142,140),d=Math.abs(x-roadX(z));
  if(d<4.8||d>12||Math.hypot(x-24,z+58)<20)continue;
  dummy.position.set(x,.015,z);dummy.rotation.y=rand(0,6.28);dummy.scale.setScalar(rand(.45,1.2));
  dummy.updateMatrix();blades.setMatrixAt(count++,dummy.matrix);
 }
 blades.count=count;blades.instanceMatrix.needsUpdate=true;blades.frustumCulled=false;scene.add(blades);
 // Small road pebbles add physical scale; only rendered in High graphics mode.
 const pebbleGeo=new THREE.IcosahedronGeometry(1,0);
 const pebbles=new THREE.InstancedMesh(pebbleGeo,new THREE.MeshStandardMaterial({color:0x938472,roughness:1}),mobile?180:380);
 const peb=new THREE.Object3D();
 for(let i=0;i<pebbles.count;i++){
  const z=rand(-143,145);
  peb.position.set(roadX(z)+rand(-4,4),.055,z);peb.rotation.y=rand(0,Math.PI*2);
  peb.scale.set(rand(.05,.19),rand(.025,.08),rand(.05,.18));
  peb.updateMatrix();pebbles.setMatrixAt(i,peb.matrix);
 }
 pebbles.instanceMatrix.needsUpdate=true;scene.add(pebbles);
 function setQuality(mode){
  const high=mode==='high';pebbles.visible=high;
  blades.visible=true;puddles.visible=true;
  if(mobile){sun.shadow.mapSize.set(high?512:256,high?512:256);}
 }
 setQuality(mobile?'low':'high');
 return {setQuality,update(camera){sky.position.copy(camera.position);},sky};
}
