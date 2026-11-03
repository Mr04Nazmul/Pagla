import * as THREE from 'three';
/**
 * Pagla picture-reference scenery upgrade. This module preserves playable
 * controls/missions and relies on real geometry, not a 2D gameplay screenshot.
 */
export function addCinematicVillage({scene, loader, roadX, mobile}) {
 const scenery=new THREE.Group();scenery.name='Reference-inspired Gram Bangla scenery';scene.add(scenery);
 const material=(color,roughness=1,more={})=>new THREE.MeshStandardMaterial({color,roughness,...more});
 const wood=material(0x684e38), wood2=material(0x9c7654), tin=material(0x7d8983,.62,{metalness:.32,side:THREE.DoubleSide}), rusty=material(0x8e6756,.83,{metalness:.12});
 const ground=material(0x987f61), rubber=material(0x25272a), chrome=material(0x9ea9a5,.32,{metalness:.65}), glass=material(0xa3b9a8,.3,{transparent:true,opacity:.78});
 const mesh=(parent,geo,mat,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.receiveShadow=true;parent.add(m);return m;};
 const cub=(parent,w,h,d,mat,x=0,y=0,z=0)=>mesh(parent,new THREE.BoxGeometry(w,h,d),mat,x,y,z);
 const cyl=(parent,top,bottom,h,mat,x,y,z)=>mesh(parent,new THREE.CylinderGeometry(top,bottom,h,9),mat,x,y,z);
 const textCanvas=document.createElement('canvas');textCanvas.width=1024;textCanvas.height=256;
 const ctx=textCanvas.getContext('2d');ctx.fillStyle='#703923';ctx.fillRect(0,0,1024,256);
 ctx.strokeStyle='#d7b582';ctx.lineWidth=14;ctx.strokeRect(13,13,998,230);
 ctx.textAlign='center';ctx.fillStyle='#fff1ce';
 ctx.font='bold 76px "Noto Sans Bengali",sans-serif';ctx.fillText('ভাই ভাই চায়ের দোকান',512,128);
 ctx.font='40px "Noto Sans Bengali",sans-serif';ctx.fillText('চা  •  বিস্কুট  •  নাস্তা',512,202);
 const signTexture=new THREE.CanvasTexture(textCanvas);signTexture.colorSpace=THREE.SRGBColorSpace;
 // Detailed roadside tea shop visible near the opening player camera.
 const tea=new THREE.Group();tea.position.set(roadX(-18)+13,0,-18);tea.rotation.y=-.12;scenery.add(tea);
 cub(tea,8.5,.2,5.5,ground,0,.08,0);
 for(const x of [-3.8,3.8])for(const z of [-2.35,2.35])cyl(tea,.095,.11,3.25,wood,x,1.73,z);
 const shade=cub(tea,9.4,.14,6.4,tin,0,3.43,0);shade.rotation.z=.05;
 for(let i=0;i<15;i++)cub(tea,.023,.027,6.4,i%5?tin:rusty,-4.35+i*.61,3.53,0);
 const sign=mesh(tea,new THREE.PlaneGeometry(6.5,1.45),material(0xffffff,.8,{map:signTexture,side:THREE.DoubleSide}),0,4.2,-2.65);
 cub(tea,6.6,.75,.85,wood,0,.96,-.85);cub(tea,6.75,.12,1,wood2,0,1.44,-.85);
 for(const x of [-2.4,2.0]) {
  cub(tea,2.15,.11,.55,wood2,x,.6,-3.15);
  for(const dx of [-.83,.83])cub(tea,.1,.48,.11,wood,x+dx,.28,-3.15);
 }
 const kettle=cyl(tea,.32,.4,.61,chrome,2.28,1.82,-.84);
 cyl(tea,.33,.33,.06,chrome,2.28,2.16,-.84);
 const teaHandle=mesh(tea,new THREE.TorusGeometry(.33,.045,8,16,Math.PI),chrome,2.28,2.41,-.84);teaHandle.rotation.z=Math.PI;
 for(let i=0;i<16;i++){
  cyl(tea,.09,.075,.16,glass,-2.85+(i%8)*.47,1.58,-.9+Math.floor(i/8)*.3);
 }
 const wraps=[0xa94335,0xe7c45c,0x6d9b4b,0xd97c40];
 for(let i=0;i<21;i++){
  cub(tea,.23,.27,.025,material(wraps[i%4]),-3.3+(i%7)*.4,2.78-Math.floor(i/7)*.31,-2.9);
 }
 const bulb=mesh(tea,new THREE.SphereGeometry(.1,9,7),material(0xffdeb3,.5),1.7,2.85,-1.4);
 const lamp=new THREE.PointLight(0xffcf9b,mobile?.4:.8,9,2);lamp.position.set(1.7,2.75,-1.4);tea.add(lamp);
 // Bamboo roadside fences to break up the flat road's edge.
 for(let z=-4;z<28;z+=2.4){
  let x=roadX(z)-8;
  cyl(scenery,.07,.09,1.3,wood,x,.66,z);
  cub(scenery,.08,.08,2.36,wood2,x,.92,z+1.12);
 }
 // Silhouetted rice clumps, instanced, to replace generic field-green.
 const riceCanvas=document.createElement('canvas');riceCanvas.width=128;riceCanvas.height=256;
 const pen=riceCanvas.getContext('2d');pen.lineCap='round';pen.strokeStyle='#68913d';pen.lineWidth=6;
 pen.beginPath();pen.moveTo(64,252);pen.lineTo(64,35);pen.stroke();
 for(let i=0;i<15;i++){
  const y=244-i*14,dir=i%2?1:-1;
  pen.strokeStyle=['#476e2c','#7da14c','#a1ae55'][i%3];pen.lineWidth=3+(i%2);
  pen.beginPath();pen.moveTo(64,y);pen.quadraticCurveTo(64+dir*45,y-18,64+dir*49,y-56);pen.stroke();
 }
 pen.strokeStyle='#c1ae6a';
 for(let i=0;i<12;i++){pen.beginPath();pen.moveTo(64,65+i*3);pen.lineTo(64+(i%2?10:-10),25+i*3);pen.stroke();}
 const riceTexture=new THREE.CanvasTexture(riceCanvas);riceTexture.colorSpace=THREE.SRGBColorSpace;
 const riceMaterial=material(0xffffff,.98,{map:riceTexture,transparent:true,alphaTest:.2,side:THREE.DoubleSide});
 const MAX=mobile?560:1550,rice=new THREE.InstancedMesh(new THREE.PlaneGeometry(.42,.83),riceMaterial,MAX);
 let seed=42421;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const dummy=new THREE.Object3D();let placed=0;
 for(let tries=0;tries<MAX*9&&placed<MAX;tries++){
  const z=-40+rnd()*135,x=(rnd()>.5?1:-1)*(13+rnd()*60);
  if(Math.abs(x-roadX(z))<11||Math.hypot(x-24,z+58)<24)continue;
  dummy.position.set(x,.41,z);dummy.rotation.y=rnd()*Math.PI*2;dummy.scale.setScalar(.7+rnd()*.6);
  dummy.updateMatrix();rice.setMatrixAt(placed++,dummy.matrix);
 }
 rice.count=placed;rice.instanceMatrix.needsUpdate=true;rice.frustumCulled=false;scenery.add(rice);
 // Pond-side water lilies and pink lotus near the mission.
 const lily=material(0x569961,1,{side:THREE.DoubleSide}),petal=material(0xe8b8c4,.75);
 for(let i=0;i<25;i++){
  const a=i*2.399963,r=Math.sqrt((i+1)/25)*9,x=24+Math.cos(a)*r,z=-58+Math.sin(a)*r;
  const leaf=mesh(scenery,new THREE.CircleGeometry(.25+(i%4)*.06,9),lily,x,.13,z);leaf.rotation.x=-Math.PI/2;
  if(i%4===0)for(let k=0;k<5;k++){
   const p=mesh(scenery,new THREE.SphereGeometry(.2,6,5),petal,x+Math.cos(k*1.26)*.13,.22,z+Math.sin(k*1.26)*.13);
   p.scale.set(.38,.32,.6);p.rotation.y=k*1.26;
  }
 }
 // Real-world-scale CC0 motorcycle. Procedural detailed fallback prevents holes.
 const bike=new THREE.Group();bike.position.set(roadX(9)-6.0,0,8);bike.rotation.y=-.58;scenery.add(bike);
 const backup=new THREE.Group();bike.add(backup);
 cub(backup,.6,.24,1.05,chrome,0,.97,0);
 const tank=mesh(backup,new THREE.SphereGeometry(.35,14,10),material(0x92312a,.38,{metalness:.29}),0,1.09,-.18);
 tank.scale.set(.92,.60,1.24);cub(backup,.5,.12,.58,material(0x24272b,.7),0,1.2,.5);
 for(const z of [-.73,.78]){
  const wheel=mesh(backup,new THREE.TorusGeometry(.38,.1,8,20),material(0x23252a),0,.39,z);wheel.rotation.y=Math.PI/2;
  const hub=cyl(backup,.09,.09,.13,chrome,0,.39,z);hub.rotation.z=Math.PI/2;
 }
 for(const sx of [-.22,.22]){const f=cyl(backup,.04,.04,.97,chrome,sx,.89,-.69);f.rotation.x=.13;}
 cub(backup,.8,.055,.08,chrome,0,1.42,-.75);
 const head=mesh(backup,new THREE.CylinderGeometry(.14,.14,.1,14),material(0xf6efcd,.3),0,1.15,-.95);head.rotation.x=Math.PI/2;
 const url='https://files.innerscene.com/library/road-motorcycle-f2519759/9dbc8024e2821e098070/motorcycle-original.glb';
 loader.load(url,({scene:g})=>{
  const b=new THREE.Box3().setFromObject(g),size=b.getSize(new THREE.Vector3());
  if(!Number.isFinite(size.x)||size.x<.05)return;
  const scale=2.1/Math.max(size.x,size.z);
  g.scale.setScalar(Math.max(.2,Math.min(4,scale)));
  b.setFromObject(g);const center=b.getCenter(new THREE.Vector3());
  g.position.set(-center.x,-b.min.y,-center.z);
  bike.add(g);backup.visible=false;
 },undefined,()=>{});
 return {
   setQuality(mode){const high=mode!=='low';rice.visible=high;lamp.visible=high;},
   objects:scenery
 };
}
