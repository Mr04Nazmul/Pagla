import * as THREE from 'three';
// Real photographed PBR materials from Poly Haven (CC0).
// Do not delay gameplay: if CDN/texture CORS fails, existing local textures remain.
export function addPhotographicMaterials({grassMat,dirtMat,tin,rust,renderer,onProgress}){
  const loader=new THREE.TextureLoader();
  const origin='https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/';
  const sets=[
    {id:'grass',texture:'leafy_grass',mat:grassMat,map:'diff',repeat:[26,26],color:0xd6e1ca},
    {id:'roof',texture:'corrugated_iron',mat:tin,map:'diff',repeat:[2.2,2.2],color:0xd3d6d0},
    {id:'roof-normal',texture:'corrugated_iron',mat:tin,map:'nor_gl',repeat:[2.2,2.2],linear:true},
    {id:'roof-rough',texture:'corrugated_iron',mat:tin,map:'rough',repeat:[2.2,2.2],linear:true},
    {id:'rust',texture:'rusty_corrugated_iron',mat:rust,map:'diff',repeat:[2.2,2.2],color:0xe0c8b3},
    {id:'rust-normal',texture:'rusty_corrugated_iron',mat:rust,map:'nor_gl',repeat:[2.2,2.2],linear:true}
  ];
  let loaded=0,failed=0;
  const report=()=>{if(onProgress)onProgress({loaded,failed,total:sets.length});};
  const setProp=(entry,tex)=>{
    tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
    tex.repeat.set(...entry.repeat);
    tex.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),4);
    tex.colorSpace=entry.linear?THREE.NoColorSpace:THREE.SRGBColorSpace;
    const m=entry.mat;
    if(entry.map==='diff'){m.map=tex;if(entry.color)m.color.setHex(entry.color);}
    else if(entry.map==='nor_gl'){m.normalMap=tex;m.normalScale.set(.26,.26);}
    else if(entry.map==='rough'){m.roughnessMap=tex;m.roughness=.9;}
    if(m===tin)m.metalness=.33;
    if(m===rust)m.metalness=.13;
    m.needsUpdate=true;
  };
  for(const entry of sets){
    const url=origin+entry.texture+'/'+entry.texture+'_'+entry.map+'_1k.jpg';
    loader.load(url,tex=>{setProp(entry,tex);loaded++;report();},undefined,()=>{failed++;report();});
  }
  // Photographic road map is already installed by the original realism pass.
  // Retain that red-earth normal/roughness pairing and its fallback.
  report();
  return {getProgress:()=>({loaded,failed,total:sets.length})};
}
