// 3D tiles first. Heavy GLB exporter loads only when the user requests a download.

const $ = id => document.getElementById(id);
const ORIGIN = Object.freeze({lat:34.6558125,lng:135.1519375});
const LICENSE_NOTE = '© OpenStreetMap contributors (ODbL), rendered via OpenFreeMap. Building heights may be estimated.';
const mobile = matchMedia('(pointer:coarse)').matches;
const maplibregl = window.maplibregl;
let map, loaded = false, orbiting = false, moving = {x:0,y:0}, working = false;
let previousFrame = performance.now(), recentCount = 0;

function status(text){ $('status').textContent = text; }
function message(text,ms=4000) {
  const n=$('message');n.textContent=text;n.classList.add('visible');
  clearTimeout(message.timer);message.timer=setTimeout(()=>n.classList.remove('visible'),ms);
}
function fatal(detail){
  $('fail').style.display='flex';$('failReason').textContent=detail;
}
function heightFor(props={}){
  const raw=props.render_height ?? props.height ?? props['building:height'];
  const val=Number(raw);
  return Number.isFinite(val)&&val>=2 ? Math.min(val,120):9.5;
}
function getBuildingFeatures(){
  if(!loaded)return [];
  try{
    return map.querySourceFeatures('openmaptiles',{sourceLayer:'building'});
  }catch(err){console.warn('Building features unavailable:',err);return [];}
}
function updateBuildingCount(){
  const unique=new Set();
  for(const f of getBuildingFeatures()){
    if(f.geometry && (f.geometry.type==='Polygon'||f.geometry.type==='MultiPolygon')){
      unique.add(f.id == null ? JSON.stringify(f.geometry.coordinates[0]?.[0]?.slice(0,3)) : String(f.id));
    }
  }
  recentCount=unique.size;
  $('count').textContent=recentCount+' visible footprints';
  $('export').disabled=recentCount===0;
}
if(!maplibregl || (typeof maplibregl.supported === 'function' && !maplibregl.supported())) {
  fatal('এই ডিভাইসে WebGL/MapLibre চালু করা যাচ্ছে না। iPhone Safari বা Android Chrome আপডেট করে চেষ্টা করো।');
} else {
  try {
    map = new maplibregl.Map({
      container:'map',
      style:'https://tiles.openfreemap.org/styles/liberty',
      center:[ORIGIN.lng,ORIGIN.lat],
      zoom:18.3, pitch:69, bearing:-22, maxPitch:85,
      canvasContextAttributes:{antialias:!mobile},
      attributionControl:true,
      interactive:true,hash:false
    });
    map.addControl(new maplibregl.NavigationControl({visualizePitch:true,showCompass:true}), 'bottom-left');
    map.on('load',()=>{
      loaded=true;
      const style=map.getStyle();
      if(!style.sources || !style.sources.openmaptiles){
        status('OpenFreeMap source পাওয়া যায়নি; 3D building layer তৈরি হয়নি।');
        return;
      }
      const labels=style.layers.find(l=>l.type==='symbol' && l.layout && l.layout['text-field'])?.id;
      // Public GSI seamless aerial imagery. Visual use only; not baked into GLB exports.
      try {
        map.addSource('gsi-ortho',{type:'raster',tiles:['https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg'],minzoom:14,maxzoom:18,tileSize:256,attribution:'© <a href="https://www.gsi.go.jp/" target="_blank">国土地理院 (GSI)</a>'});
        map.addLayer({id:'gsi-aerial',type:'raster',source:'gsi-ortho',minzoom:14,paint:{'raster-opacity':.95}},labels);
      } catch(error) {console.warn('Optional GSI aerial photography failed',error);}
      // OpenMapTiles building source carries OSM building footprints and some surveyed heights.
      map.addLayer({
        id:'pagla-japan-buildings-3d',
        type:'fill-extrusion',
        source:'openmaptiles',
        'source-layer':'building',
        minzoom:13,
        paint:{
          'fill-extrusion-color':['interpolate',['linear'],
            ['to-number',['coalesce',['get','render_height'],['get','height'],9.5]],
            0,'#d0c2b0',9,'#dbd0c1',23,'#b9c3c1',55,'#96aabd'],
          'fill-extrusion-height':['to-number',['coalesce',['get','render_height'],['get','height'],9.5]],
          'fill-extrusion-base':['to-number',['coalesce',['get','render_min_height'],['get','min_height'],0]],
          'fill-extrusion-opacity':.94,
          'fill-extrusion-vertical-gradient':true
        }
      },labels);
      status('✅ বাস্তব OSM রাস্তা ও building footprint-এর 3D দৃশ্য তৈরি হয়েছে');
      updateBuildingCount();
    });
    map.on('idle',updateBuildingCount);
    map.on('error',e=>{
      console.warn('MapLibre issue:',e.error||e);
      if(!loaded) status('ম্যাপের ডেটা লোডে সমস্যা হচ্ছে—ইন্টারনেট ও Safari পরীক্ষা করো।');
    });
    map.on('click',e=>{
      const features=map.queryRenderedFeatures(e.point,{layers:['pagla-japan-buildings-3d']});
      if(!features.length)return;
      const f=features[0];
      const h=heightFor(f.properties);
      message('এই ভবনের map height: '+h.toFixed(1)+' মিটার (ডেটা না থাকলে আনুমানিক)');
    });
  } catch(err){fatal('3D map চালু করা যায়নি: '+err.message);}
}

// No entrance overlay. Map loads on page open without an additional tap.
$('walk').addEventListener('click',()=>{
  orbiting=false;
  map?.easeTo({pitch:78,zoom:18.7,duration:720});
  message('Walk camera · joystick সামনের দিকে নাও');
});
$('bird').addEventListener('click',()=>{
  orbiting=false;map?.easeTo({pitch:8,zoom:17.9,duration:800});
});
$('orbit').addEventListener('click',()=>{
  orbiting=!orbiting;
  $('orbit').textContent=orbiting?'■ Stop':'↻ Orbit';
  if(orbiting)map?.easeTo({pitch:67,zoom:18.0,duration:450});
});
$('reset').addEventListener('click',()=>{
  orbiting=false;$('orbit').textContent='↻ Orbit';
  map?.flyTo({center:[ORIGIN.lng,ORIGIN.lat],zoom:18.3,pitch:69,bearing:-22,speed:1.1});
});
let aerialOn=true;
$('aerial').addEventListener('click',()=>{
  aerialOn=!aerialOn;
  if(map?.getLayer('gsi-aerial'))map.setLayoutProperty('gsi-aerial','visibility',aerialOn?'visible':'none');
  $('aerial').textContent=aerialOn?'🛰 航空写真 ON':'🗺 Map only';
  message(aerialOn?'GSI aerial imagery + OSM 3D':'OpenStreetMap 3D without aerial');
});

const joy=$('joy'),knob=$('knob');let joyPointer=null;
function setJoystick(e){
  const r=joy.getBoundingClientRect(),dx=(e.clientX-r.left-r.width/2)/46,dy=(e.clientY-r.top-r.height/2)/46;
  const length=Math.max(1,Math.hypot(dx,dy));moving.x=dx/length;moving.y=dy/length;
  knob.style.transform='translate('+(moving.x*35)+'px,'+(moving.y*35)+'px)';
}
function releaseJoystick(e){
  if(joyPointer===null||(e && e.pointerId!==joyPointer))return;
  joyPointer=null;moving.x=moving.y=0;knob.style.transform='translate(0,0)';
}
joy.addEventListener('pointerdown',e=>{
  joyPointer=e.pointerId;joy.setPointerCapture(e.pointerId);setJoystick(e);
});
joy.addEventListener('pointermove',e=>{if(joyPointer===e.pointerId)setJoystick(e);});
joy.addEventListener('pointerup',releaseJoystick);
joy.addEventListener('pointercancel',releaseJoystick);
window.addEventListener('blur',()=>releaseJoystick(null));
function tick(now){
  const dt=Math.min(.05,(now-previousFrame)/1000||.016);previousFrame=now;
  if(loaded){
    if(orbiting && !working)map.setBearing(map.getBearing()+dt*12);
    if(!working && (Math.abs(moving.x)>.04||Math.abs(moving.y)>.04)){
      const center=map.getCenter(),a=map.getBearing()*Math.PI/180;
      const forward=-moving.y,strafe=moving.x,speed=3.5;
      const east=(forward*Math.sin(a)+strafe*Math.cos(a))*dt*speed;
      const north=(forward*Math.cos(a)-strafe*Math.sin(a))*dt*speed;
      const lng=center.lng+east/(111320*Math.cos(center.lat*Math.PI/180));
      const lat=center.lat+north/110940;
      map.jumpTo({center:[lng,lat],pitch:Math.max(64,map.getPitch())});
    }
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);


// Optional model export. Module is imported only after a button tap so that a blocked
// third-party Three.js host never leaves an opaque splash over the map.
$('export').addEventListener('click',async()=>{
  if(working||!loaded)return;
  working=true;$('export').disabled=true;
  try{
    const module=await import('./export-glb.js?v=20261103j3');
    await module.saveGLB({map,ORIGIN,getBuildingFeatures,heightFor,status,message,updateBuildingCount});
  }catch(err){
    console.error('GLB import/export error:',err);
    status('GLB export failed: '+String(err?.message||err));
    message('GLB export-এর জন্য প্রয়োজনীয় model library লোড হয়নি।',5500);
  }finally{working=false;updateBuildingCount();}
});
