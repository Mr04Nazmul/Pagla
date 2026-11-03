import * as THREE from 'three';
// Original procedural splat layer; optional Spark.js 2.4, following hybrid
// mesh + Gaussian-splat techniques exemplified by MIT-licensed Worldsplats.
// No scanned/photo-real Bangladesh scene is bundled with this code.
export function createHybridWorld({scene,renderer,mobile,roadX,onStatus}){
 let installed=false,enabled=false,loading=false,quality='cinematic',spark=null,cloud=null;
 const report=m=>onStatus?.(m);
 async function toggle(){
  if(loading)return enabled;
  if(installed){enabled=!enabled;spark.visible=cloud.visible=enabled&&quality!=='low';report(enabled?'Gaussian foliage চালু':'Gaussian foliage বন্ধ');return enabled;}
  loading=true;report('Spark.js loading…');
  try{
   if(!renderer.capabilities.isWebGL2)throw new Error('WebGL2 unsupported');
   const {SparkRenderer,SplatMesh}=await import('@sparkjsdev/spark');
   const spr=new SparkRenderer({renderer});
   const spl=new SplatMesh({constructSplats:splats=>{
    let seed=20310619;
    const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
    const p=new THREE.Vector3(),size=new THREE.Vector3(),rotation=new THREE.Quaternion(),color=new THREE.Color();
    const crowns=[[-11,-4,7.6,4.2],[-18,-25,7.3,5.7],[17,-39,6.5,4.5],[-15,-66,7.1,5],[28,-91,8.1,6],[-24,-105,7.2,4.5],[26,45,7.2,5.1],[-21,78,7.4,5.4],[19,103,6.5,4.8]];
    for(let i=0;i<(mobile?3500:9600);i++){
     const [x,z,y,r]=crowns[i%crowns.length],a=rand()*Math.PI*2,radius=Math.sqrt(rand())*r;
     p.set(x+Math.cos(a)*radius,y+(rand()-.5)*r*.68,z+Math.sin(a)*radius);
     size.set(.12+rand()*.21,.12+rand()*.22,.11+rand()*.2);
     color.setRGB(.10+rand()*.11,.21+rand()*.18,.055+rand()*.09);
     splats.pushSplat(p,size,rotation,.65+rand()*.31,color);
    }
    for(let i=0;i<(mobile?700:1800);i++){
     const z=-120+rand()*245,edge=rand()<.5?-1:1;
     p.set(roadX(z)+edge*(8.7+rand()*4),.24+rand()*.55,z);
     size.set(.12+rand()*.21,.2+rand()*.26,.12+rand()*.22);
     color.setRGB(.18+rand()*.1,.26+rand()*.2,.055+rand()*.12);
     splats.pushSplat(p,size,rotation,.55+rand()*.35,color);
    }
   }});
   spr.visible=spl.visible=quality!=='low';scene.add(spr);scene.add(spl);
   spark=spr;cloud=spl;installed=enabled=true;report('Spark.js foliage সক্রিয়');
  }catch(err){console.warn('Optional Spark.js layer unavailable',err);report('Splat চলেনি; সাধারণ 3D mode চলছে');enabled=false;}
  finally{loading=false;}
  return enabled;
 }
 return {toggle,isEnabled:()=>enabled,setQuality(q){quality=q;if(spark)spark.visible=cloud.visible=enabled&&quality!=='low';}};
}
