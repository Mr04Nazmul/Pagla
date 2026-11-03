import * as THREE from 'three';

// Bangladesh roadside village detail pass: real scale with near-camera texture and
// believable architectural layers instead of single flat-colored cuboids.
// Unbranded, original geometry, no photo collages or licensed scenery.
export function decorateVillage(scene, { mobile=false }={}) {
  const clay = new THREE.MeshStandardMaterial({color:0x9f896c,roughness:.93});
  const darkWood = new THREE.MeshStandardMaterial({color:0x57402d,roughness:.86});
  const lightWood = new THREE.MeshStandardMaterial({color:0x9c7852,roughness:.94});
  const windowGlass = new THREE.MeshPhysicalMaterial({color:0x223e39,roughness:.25,metalness:0,clearcoat:.7});
  const black = new THREE.MeshStandardMaterial({color:0x26231c,roughness:.84});
  const galvanized = new THREE.MeshStandardMaterial({color:0x858a80,roughness:.56,metalness:.42,side:THREE.DoubleSide});
  const red = new THREE.MeshStandardMaterial({color:0x823e34,roughness:.85});
  const sack = new THREE.MeshStandardMaterial({color:0xa6a081,roughness:.98});
  const line = new THREE.MeshStandardMaterial({color:0xb5a48c,roughness:.95});
  const leaves = new THREE.MeshStandardMaterial({color:0x2e6b32,roughness:.99,side:THREE.DoubleSide});
  const metal = new THREE.MeshStandardMaterial({color:0xa49c8b,metalness:.58,roughness:.55});
  const inst=[];
  function box(parent, w,h,d,material, x=0,y=0,z=0){
    const p=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
    p.position.set(x,y,z);p.castShadow=!mobile;p.receiveShadow=true;parent.add(p);return p;
  }
  function pole(parent,x,y,z,height,radius=.055,material=darkWood){
    const p=new THREE.Mesh(new THREE.CylinderGeometry(radius*.8,radius,height,7),material);
    p.position.set(x,y,z);p.castShadow=!mobile;parent.add(p);return p;
  }
  function fadedText(title,subtitle, color='#692e27'){
    const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=260;
    const ctx=canvas.getContext('2d');ctx.fillStyle=color;ctx.fillRect(0,0,1024,260);
    ctx.fillStyle='#ead0a2';ctx.fillRect(15,15,994,230);
    ctx.fillStyle=color;ctx.fillRect(23,23,978,214);
    ctx.font='bold 86px "Noto Sans Bengali",system-ui,sans-serif';ctx.textAlign='center';
    ctx.fillStyle='#f3dbb6';ctx.fillText(title,512,128);
    ctx.font='43px "Noto Sans Bengali",system-ui,sans-serif';ctx.fillText(subtitle,512,196);
    for(let i=0;i<720;i++){
      const x=Math.random()*1024,y=Math.random()*260;
      ctx.fillStyle='rgba(238,218,191,.11)';ctx.fillRect(x,y,Math.random()*15+1,Math.random()*3+1);
    }
    const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=2;return tex;
  }
  // A real frontage: window recessed behind shutters, exposed eave posts,
  // verandah slab and visible corrugated overhang.
  function facade(x,z,scale,yaw,index){
    const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=yaw;g.scale.setScalar(scale);scene.add(g);
    const porch=new THREE.Group();porch.position.z=-4.3;g.add(porch);
    box(porch,8.15,.16,2.15,clay,0,.06,0);
    for(const xx of [-3.4,3.4]){
      pole(porch,xx,1.45,-.85,2.85,.085,lightWood);
      box(porch,.32,.16,.34,darkWood,xx,2.92,-.85);
      box(porch,.3,.18,.3,clay,xx,.13,-.85);
    }
    const frontAwning=box(porch,8.65,.09,3.2,galvanized,0,2.95,-.22);
    frontAwning.rotation.x=-.045;
    for(let i=-12;i<=12;i++){
      const rib=box(porch,.027,.027,3.23,metal,i*.34,3.013,-.22);rib.rotation.x=-.045;
    }
    for(const wx of [-1.75,1.1]){
      box(g,1.52,1.32,.10,darkWood,wx,2.15,-3.115);
      box(g,1.34,1.15,.055,windowGlass,wx,2.14,-3.185);
      box(g,.08,1.24,.11,lightWood,wx,2.14,-3.245);
      box(g,1.45,.085,.11,lightWood,wx,2.77,-3.25);
      box(g,1.45,.09,.14,lightWood,wx,1.52,-3.25);
      for(const s of [-1,1]){
        const shutter=box(g,.33,1.35,.10, index%3===0?red:darkWood,wx+s*.93,2.15,-3.19);
        shutter.rotation.y=s*.22;
      }
    }
    // Recessed door and its weathered threshold
    box(g,1.53,2.26,.10,darkWood,3.12,1.16,-3.22);
    box(g,1.30,2.14,.07,index%2?red:lightWood,3.12,1.18,-3.30);
    box(g,.09,.13,.07,metal,3.61,1.13,-3.39);
    box(g,2.0,.09,.8,clay,3.12,.045,-3.38);
    // Wooden woven bed, water pot, cooking bundles outside, without floating.
    if(index%2===0){
      box(porch,1.30,.15,.74,lightWood,-2.2,.52,-.36);
      for(const leg of [-.48,.48])pole(porch,-2.2+leg,.29,-.36,.46,.04);
      const pot=new THREE.Mesh(new THREE.SphereGeometry(.31,10,8),clay);pot.position.set(2.1,.34,-.22);porch.add(pot);
      pole(porch,2.1,.71,-.22,.26,.075);
    } else {
      const stack=box(porch,.65,.28,.65,sack,2.36,.18,-.2);stack.rotation.y=.2;
      box(porch,.56,.31,.72,sack,2.36,.47,-.12);
    }
    inst.push(g);return g;
  }
  const houses=[
    [19,-29,1,.2],[-17,-31,.9,-.1],[13,-65,.9,.38],[-22,-65,1,0],
    [18,-104,1.1,.17],[-15,-119,1,.12],[28,31,.82,.2],[-20,43,.92,-.2],
    [26,91,1.05,.4],[-23,103,.9,-.3]
  ];
  houses.forEach((h,i)=>facade(...h,i));
  // Tea shop: readable Bengali sign, serving counter, kettle, simple seating.
  const market=new THREE.Group();market.position.set(-17,0,-91);scene.add(market);
  const signMat=new THREE.MeshStandardMaterial({map:fadedText('ভাই ভাই চায়ের দোকান','চা • বিস্কুট • নাস্তা'),roughness:.88,side:THREE.DoubleSide});
  const sign=new THREE.Mesh(new THREE.PlaneGeometry(8.0,1.75),signMat);
  sign.position.set(0,3.72,-3.35);sign.rotation.y=Math.PI;market.add(sign);
  box(market,8.5,.14,1.8,galvanized,0,3.13,-3.12);
  for(let i=-12;i<=12;i++)box(market,.03,.035,1.8,metal,i*.34,3.22,-3.12);
  for(const px of [-4,4])pole(market,px,1.57,-3.8,3.1,.075);
  box(market,5.4,.19,.95,darkWood,0,1.12,-3.58);
  for(let x=-2.4;x<=2.4;x+=1.2)box(market,.10,1.15,.10,lightWood,x,.53,-3.58);
  const kettle=new THREE.Mesh(new THREE.CylinderGeometry(.28,.31,.45,13),metal);
  kettle.position.set(1.85,1.46,-3.5);market.add(kettle);
  pole(market,1.85,1.78,-3.5,.15,.045,black);
  for(const x of [-2.2,-1.25,-.28]){
    const glass=new THREE.Mesh(new THREE.CylinderGeometry(.085,.072,.15,10),new THREE.MeshStandardMaterial({color:0x9b7142,roughness:.1,transparent:true,opacity:.65}));
    glass.position.set(x,1.29,-3.55);market.add(glass);
  }
  // Store bunting / snack packet strings by the serving counter.
  const colors=[0xbf812f,0xb43b2d,0x61984f,0xe0bb4d,0x7090a4];
  for(let col=0;col<5;col++)for(let row=0;row<4;row++){
    const item=box(market,.17,.25,.025,new THREE.MeshStandardMaterial({color:colors[col],roughness:.8}),-2.4+col*.25,2.7-row*.25,-3.5);
    item.rotation.z=Math.sin(col*2+row)*.05;
  }
  // A bamboo basket full of vegetables by the road.
  const baskets=[[7,8],[10,-21],[-10,-86],[-24,47]];
  baskets.forEach(([x,z])=>{
    const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
    const basket=new THREE.Mesh(new THREE.CylinderGeometry(.4,.3,.38,14,1,true),lightWood);
    basket.position.y=.2;g.add(basket);
    for(let i=0;i<7;i++){
      const vegetable=new THREE.Mesh(new THREE.SphereGeometry(.115,8,6),leaves);
      vegetable.position.set(Math.sin(i*2.4)*.23,.45,Math.cos(i*2.4)*.23);g.add(vegetable);
    }
  });
  return {houseCount:houses.length,market};
}
