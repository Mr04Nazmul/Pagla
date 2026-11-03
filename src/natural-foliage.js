import * as THREE from 'three';
// Pagla - leaf-shaped cross-card tree crowns rather than solid low-poly balls.
// Procedural canopy silhouette is original; quality remains mobile conscious.
function seeded(n){return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
export function makeFoliageCrown(){
  const random=seeded(840115);
  const cv=document.createElement('canvas');cv.width=512;cv.height=512;
  const c=cv.getContext('2d');c.clearRect(0,0,512,512);
  // Small overlapping leaves with varied size, veins, and dappled highlights.
  // Dark core prevents see-through balls; no opaque rectangular planes.
  for(let layer=0;layer<3;layer++){
    const n=layer===0?90:layer===1?105:90;
    for(let k=0;k<n;k++){
      const cx=256+(random()-.5)*(layer===0?250:400);
      const cy=255+(random()-.5)*(layer===0?250:410);
      const nx=(cx-256)/248,ny=(cy-256)/248;
      if(nx*nx+ny*ny>1.04)continue;
      const l=7+random()*18,w=l*(.28+random()*.29),rot=random()*Math.PI*2;
      c.save();c.translate(cx,cy);c.rotate(rot);
      const hue=97+Math.floor(random()*37),s=29+Math.floor(random()*29);
      const lum=layer===0?(13+random()*8):layer===1?(19+random()*9):(25+random()*11);
      const gradient=c.createLinearGradient(-l,0,l,0);
      gradient.addColorStop(0,'hsl('+hue+','+s+'%,'+(lum-5)+'%)');
      gradient.addColorStop(.54,'hsl('+hue+','+(s+6)+'%,'+(lum+4)+'%)');
      gradient.addColorStop(1,'hsl('+hue+','+s+'%,'+(lum-3)+'%)');
      c.fillStyle=gradient;
      c.beginPath();c.moveTo(-l/2,0);
      c.quadraticCurveTo(-l/6,-w,l/2,0);
      c.quadraticCurveTo(l/6,w,-l/2,0);c.fill();
      c.strokeStyle='rgba(210,224,154,.21)';c.lineWidth=.65;
      c.beginPath();c.moveTo(-l/2,0);c.lineTo(l/2,0);c.stroke();
      c.restore();
    }
  }
  const tex=new THREE.CanvasTexture(cv);
  tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=2;
  const leafMaterial=new THREE.MeshStandardMaterial({
    color:0xf7fcef,map:tex,side:THREE.DoubleSide,alphaTest:.38,
    roughness:.96,metalness:0,depthWrite:true
  });
  const geo=new THREE.BufferGeometry();
  const points=[],uv=[],ids=[];
  const addQuad=(cx,cy,cz,width,height,ry,rx)=>{
    // One leaf-bearing plane; rotations give volumetric, non-spherical foliage.
    const A=width*.5,B=height*.5;
    const cc=Math.cos(ry),ss=Math.sin(ry),cr=Math.cos(rx),sr=Math.sin(rx);
    const base=points.length/3;
    for(let [x,y,u,v] of [[-A,-B,0,0],[A,-B,1,0],[A,B,1,1],[-A,B,0,1]]){
      const py=y*cr,zz=y*sr;
      points.push(cx+x*cc+zz*ss,cy+py,cz-x*ss+zz*cc);
      uv.push(u,v);
    }
    ids.push(base,base+1,base+2,base,base+2,base+3);
  };
  for(let j=0;j<7;j++){
    const a=j*2.399963+random()*.2;
    const radius=j%3===0?.16:.27;
    addQuad(Math.cos(a)*radius,(random()-.5)*.22,Math.sin(a)*radius,
      .94+random()*.33,.85+random()*.28,a,(random()-.5)*.65);
  }
  geo.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  geo.setIndex(ids);geo.computeVertexNormals();geo.computeBoundingSphere();
  return {geometry:geo,material:leafMaterial};
}
