import * as THREE from 'three';

// Pagla rural-world expansion: mobile-friendly additions; CC0 external GLB assets.
export function installVillageUpgrade({scene,loader,mobile,roadX,roofMat,onStatus}) {
  // This module keeps existing missions, mobile controls and fallback gameplay intact.
  const materials = {};
  const mat=(hex,roughness=1)=>new THREE.MeshStandardMaterial({color:hex,roughness,metalness:0});
  const addBox=(g,x,y,z,w,h,d,m)=>{
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);
    mesh.position.set(x,y,z);mesh.receiveShadow=true;g.add(mesh);return mesh;
  };
  const makeSheetTexture=(roof=false)=>{
    const cv=document.createElement('canvas');cv.width=256;cv.height=256;
    const c=cv.getContext('2d');
    c.fillStyle=roof?'#8c9793':'#9c9d93';c.fillRect(0,0,256,256);
    for(let x=0;x<256;x+=8){
      c.fillStyle=roof?'#aeb6b1':'#b6b8af';c.fillRect(x,0,2,256);
      c.fillStyle='#5a6763';c.fillRect(x+4,0,2,256);
      c.fillStyle='#7a8580';c.fillRect(x+6,0,1,256);
    }
    let seed=roof?12111:78261;
    const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    for(let i=0;i<1700;i++){
      const x=rand()*256,y=rand()*256;
      c.fillStyle=rand()>.45?'rgba(84,59,46,.11)':'rgba(245,240,215,.085)';
      c.fillRect(x,y,1+rand()*2,2+rand()*13);
    }
    for(let i=0;i<16;i++){
      c.strokeStyle='rgba(103,58,38,.17)';c.lineWidth=1+rand()*2;
      c.beginPath();c.moveTo(rand()*256,rand()*256);c.lineTo(rand()*256,rand()*256);c.stroke();
    }
    const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;
    t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=2;return t;
  };
  const sheetMat=new THREE.MeshStandardMaterial({map:makeSheetTexture(false),color:0xe9e5dd,roughness:.88,metalness:.15});
  const roofSheet=new THREE.MeshStandardMaterial({map:makeSheetTexture(true),color:0xd2bfb1,roughness:.78,metalness:.2,side:THREE.DoubleSide});
  // The older town's roof material is shared by existing houses.
  roofMat.map=makeSheetTexture(true);roofMat.needsUpdate=true;
  const wood=mat(0x70513d),ground=mat(0x947a55),shade=mat(0x352e28),fabric=mat(0x607052);
  function sheetHome(x,z,scale=1,rotation=0) {
    const h=new THREE.Group();h.position.set(x,0,z);h.rotation.y=rotation;h.scale.setScalar(scale);scene.add(h);
    addBox(h,0,.15,0,7,.3,5.3,ground);
    addBox(h,0,1.9,0,6.8,3.2,5.1,sheetMat);
    const roof=new THREE.BufferGeometry();
    const verts=new Float32Array([
       -4,3.45,-3.15,0,5.0,-3.15,0,5.0,3.15,-4,3.45,3.15,
        0,5.0,-3.15,4,3.45,-3.15,4,3.45,3.15,0,5.0,3.15
    ]);
    roof.setAttribute('position',new THREE.BufferAttribute(verts,3));
    roof.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1],2));
    roof.setIndex([0,1,2,0,2,3,4,5,6,4,6,7]);roof.computeVertexNormals();
    const roofMesh=new THREE.Mesh(roof,roofSheet);h.add(roofMesh);
    addBox(h,0,1.5,2.61,1.5,2.5,.08,wood);
    addBox(h,-2.0,2.1,2.62,.93,1.12,.08,shade);
    addBox(h,2.05,2.1,2.62,.93,1.12,.08,shade);
    addBox(h,-2,2.1,2.70,.07,1.1,.08,wood);
    addBox(h,2.05,2.1,2.70,.07,1.1,.08,wood);
    for(const xx of [-2.9,2.9])addBox(h,xx,1.7,3.18,.14,3.4,.16,wood);
    addBox(h,0,3.28,3.15,6,.12,.17,wood);
    addBox(h,0,.18,3.22,6,.2,1.5,ground);
    const cloth=addBox(h,2.1,1.2,3.55,.77,1.12,.025,fabric);cloth.rotation.z=.09;
    return h;
  }
  for(const [x,z,s,a] of [
    [-31,26,1,.12],[28,39,.92,-.34],[-24,-27,.86,.08],
    [44,-59,1.02,-.3],[-37,-63,.96,.18],[35,75,.88,.2]
  ]) sheetHome(x,z,s,a);
  // Repeating rice plants are deliberately near the camera, rather than filling
  // the entire field with high-poly GLBs on an iPhone.
  const riceSpots=[];
  for(const [cx,cz] of [[-15,12],[18,9],[-18,-43]]){
    for(let r=0;r<(mobile?3:6);r++){
      for(let c=0;c<4;c++){
        const xx=cx+c*.67, zz=cz+r*.85;
        if(Math.abs(xx-roadX(zz))>7)riceSpots.push([xx,zz]);
      }
    }
  }
  const assets=[
    {id:'Rice GLB',url:'https://cdn.3dassets.dev/assets/19389/v1/model.glb',kind:'rice'},
    {id:'Villager man',url:'https://cdn.3dassets.dev/assets/36378/v1/model.glb',points:[[-11,-76,2],[-24,-68,-.5],[17,-22,.3]]},
    {id:'Villager woman',url:'https://cdn.3dassets.dev/assets/36379/v1/model.glb',points:[[-16,-81,-1],[30,26,1.3]]},
    {id:'Corrugated market shed',url:'https://cdn.3dassets.dev/assets/215/v1/model.glb',points:[[-29,-92,.2]]},
    {id:'Farm cow',url:'https://cdn.3dassets.dev/assets/29184/v1/model.glb',points:[[roadX(-30)-10,-30,.25]]}
  ];
  let loaded=0,failed=0;
  const report=()=>onStatus&&onStatus('পরিবেশ: '+loaded+'/'+assets.length+' GLB loaded'+(failed?' · '+failed+' unavailable':''));
  report();
  for(const a of assets){
    loader.load(a.url,(gltf)=>{
      try{
        if(a.kind==='rice'){
          for(const [x,z] of riceSpots){
            const plant=gltf.scene.clone(true);plant.position.set(x,0.03,z);
            const size=.75+(Math.abs(x*11+z*3)%13)/35;
            plant.scale.setScalar(size);scene.add(plant);
          }
        }else{
          for(const [x,z,angle] of a.points){
            const obj=gltf.scene.clone(true);obj.position.set(x,0.04,z);
            obj.rotation.y=angle;
            scene.add(obj);
          }
        }
        loaded++;report();
      }catch(error){failed++;report();console.warn('Pagla upgrade GLB placement failed',a.id,error);}
    },undefined,error=>{failed++;report();console.warn('Pagla upgrade GLB unavailable',a.id,error);});
  }
  // Simple living villagers are distinct from the static licensed GLB crowd.
  // Their body parts move in a restrained walking cycle; no heavy skinning.
  const villagers=[];
  function movingVillager(px,pz,shirtColor,lungiColor,speed,route=7){
    const g=new THREE.Group();g.position.set(px,0,pz);scene.add(g);
    const skin=mat(0xb6825e),shirt=mat(shirtColor),lungi=mat(lungiColor),hair=mat(0x181712);
    addBox(g,0,1.30,0,.55,.72,.30,shirt);
    const neck=new THREE.Mesh(new THREE.CylinderGeometry(.095,.11,.18,9),skin);
    neck.position.y=1.73;g.add(neck);
    const head=new THREE.Mesh(new THREE.SphereGeometry(.235,12,9),skin);
    head.position.y=2.02;head.scale.set(1,1.15,.89);g.add(head);
    const hairCap=new THREE.Mesh(new THREE.SphereGeometry(.24,12,8,0,Math.PI*2,0,1.1),hair);
    hairCap.position.y=2.095;g.add(hairCap);
    const hips=new THREE.Mesh(new THREE.CylinderGeometry(.27,.38,.75,12),lungi);
    hips.position.y=.73;g.add(hips);
    const arms=[];
    for(const side of [-1,1]){
      const arm=new THREE.Group();arm.position.set(side*.38,1.55,0);g.add(arm);
      const upper=new THREE.Mesh(new THREE.CylinderGeometry(.11,.105,.43,9),shirt);
      upper.position.y=-.21;arm.add(upper);
      const forearm=new THREE.Mesh(new THREE.CylinderGeometry(.092,.078,.28,9),skin);
      forearm.position.y=-.56;arm.add(forearm);arms.push(arm);
    }
    const shoes=mat(0x343229);
    for(const side of [-1,1])addBox(g,side*.17,.14,-.08,.21,.22,.4,shoes);
    villagers.push({g,arms,origin:[px,pz],speed,route,phase:Math.abs(px*14+pz)});
  }
  movingVillager(3,-9,0x567d69,0x385d6a,.19,8);
  movingVillager(-6,-45,0xc7b699,0x567d52,.14,5);
  movingVillager(-13,-89,0x496982,0x5a5049,.12,6);
  movingVillager(5,55,0x705546,0x55666a,.16,7);
  return {
    update(dt,now){
      const t=now*.001;
      for(const v of villagers){
        const a=t*v.speed+v.phase;
        v.g.position.x=v.origin[0]+Math.cos(a)*v.route;
        v.g.position.z=v.origin[1]+Math.sin(a)*v.route*.6;
        v.g.rotation.y=-a;
        v.g.position.y=Math.abs(Math.sin(t*5+a))*.035;
        v.arms[0].rotation.x=Math.sin(t*5+a)*.23;
        v.arms[1].rotation.x=-Math.sin(t*5+a)*.23;
      }
    }
  };
}
