import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

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
if(!maplibregl || !maplibregl.supported()) {
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

$('begin').addEventListener('click',()=>{
  $('overlay').classList.add('hide');
  map?.resize();
  message('Joyst​​ick দিয়ে হাঁটার মতো করে ক্যামেরা এগিয়ে নাও',2600);
});
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
  if(loaded && $('overlay').classList.contains('hide')){
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

// These are real OSM derived features currently loaded into the viewport.
// Export is limited to a 250-metre radius and is explicitly an approximation:
// footprints are mapped, but unknown heights become 9.5 m blocks.
const MAX_RADIUS=250;
const SCALE_LON=111320*Math.cos(ORIGIN.lat*Math.PI/180),SCALE_LAT=110940;
function xy(lngLat){
  const lon=lngLat[0],lat=lngLat[1];
  return [(lon-ORIGIN.lng)*SCALE_LON,(lat-ORIGIN.lat)*SCALE_LAT];
}
function inside(x,y){return Math.hypot(x,y)<=MAX_RADIUS;}
function addRing(path,coordinates){
  if(!coordinates||coordinates.length<4)return;
  const pts=coordinates.map(xy);
  path.moveTo(pts[0][0],pts[0][1]);
  for(let i=1;i<pts.length;i++)path.lineTo(pts[i][0],pts[i][1]);
  path.closePath();
}
function polygonsOf(feature){
  if(!feature.geometry)return [];
  if(feature.geometry.type==='Polygon')return [feature.geometry.coordinates];
  if(feature.geometry.type==='MultiPolygon')return feature.geometry.coordinates;
  return [];
}
function exportBuildings(group){
  const features=getBuildingFeatures(),seen=new Set();
  const neutral=['#c1b7a9','#d8cebf','#afbdbd','#e1d6c7','#abb8be'];
  const mats=neutral.map(color=>new THREE.MeshStandardMaterial({color,roughness:.93,metalness:0}));
  let count=0,estimated=0;
  for(const feature of features) {
    if(count>=600)break;
    const h=heightFor(feature.properties||{});
    const hasRealHeight=feature.properties && (feature.properties.render_height!=null||feature.properties.height!=null);
    for(const polygon of polygonsOf(feature)){
      if(!polygon||!polygon[0]||polygon[0].length<4)continue;
      const points=polygon[0].map(xy),center=points.reduce((acc,p)=>[acc[0]+p[0]/points.length,acc[1]+p[1]/points.length],[0,0]);
      if(!inside(center[0],center[1]))continue;
      const key=(feature.id??'')+':'+Math.round(center[0]*10)+':'+Math.round(center[1]*10);
      if(seen.has(key))continue;seen.add(key);
      const shape=new THREE.Shape();addRing(shape,polygon[0]);
      for(let holeIndex=1;holeIndex<polygon.length;holeIndex++){
        const hole=new THREE.Path();addRing(hole,polygon[holeIndex]);shape.holes.push(hole);
      }
      try{
        const geometry=new THREE.ExtrudeGeometry(shape,{depth:h,bevelEnabled:false,steps:1,curveSegments:2});
        geometry.rotateX(-Math.PI/2);
        const mesh=new THREE.Mesh(geometry,mats[count%neutral.length]);
        mesh.name='OSM_Building_'+String(feature.id??count);
        group.add(mesh);count++;if(!hasRealHeight)estimated++;
      }catch(e){console.warn('Skipping invalid footprint',e);}
    }
  }
  return {count,estimated};
}
function exportRoads(group) {
  let features=[];
  try{features=map.querySourceFeatures('openmaptiles',{sourceLayer:'transportation'});}catch(e){return 0;}
  const verts=[],seen=new Set();
  let segments=0;
  for(const f of features){
    if(segments>=800)break;
    const cls=f.properties?.class;
    if(!cls)continue;
    const width=cls==='motorway'?12:cls==='trunk'?10:cls==='primary'?8:cls==='secondary'?7:cls==='tertiary'?6:cls==='residential'?4.8:cls==='service'?3.2:cls==='pedestrian'?3:cls==='path'?1.5:3.5;
    const geom=f.geometry;
    const lines=geom?.type==='LineString'?[geom.coordinates]:geom?.type==='MultiLineString'?geom.coordinates:[];
    for(const line of lines){
      for(let i=1;i<line.length&&segments<800;i++){
        const [ax,ay]=xy(line[i-1]),[bx,by]=xy(line[i]);
        const midx=(ax+bx)/2,midy=(ay+by)/2,dx=bx-ax,dy=by-ay,len=Math.hypot(dx,dy);
        if(len<.4||len>260||!inside(midx,midy))continue;
        const key=[ax,ay,bx,by].map(v=>Math.round(v*2)).join('_');
        if(seen.has(key))continue;seen.add(key);
        const px=dy/len*width/2,py=-dx/len*width/2;
        const pts=[[ax+px,ay+py],[ax-px,ay-py],[bx+px,by+py],[bx-px,by-py]];
        for(const k of [0,1,2,1,3,2]){
          const p=pts[k];verts.push(p[0],.018,-p[1]);
        }
        segments++;
      }
    }
  }
  if(verts.length){
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
    geometry.computeVertexNormals();
    const road=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:'#636564',roughness:1,side:THREE.DoubleSide}));
    road.name='OSM_Roads';group.add(road);
  }
  return segments;
}
$('export').addEventListener('click',async()=>{
  if(working||!loaded)return;
  working=true;orbiting=false;$('orbit').textContent='↻ Orbit';
  $('export').disabled=true;status('GLB 3D model তৈরি হচ্ছে…');
  try {
    const scene=new THREE.Scene();
    scene.name='Kobe Futabacho Japan - OSM derived 3D';
    scene.userData={center:[ORIGIN.lng,ORIGIN.lat],radiusMetres:MAX_RADIUS,attribution:LICENSE_NOTE,license:'OpenStreetMap ODbL'};
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(540,540),
      new THREE.MeshStandardMaterial({color:'#c8c9c4',roughness:1,side:THREE.DoubleSide}));
    ground.rotation.x=-Math.PI/2;ground.position.y=-.09;ground.name='ground_reference_plane';
    scene.add(ground);
    const buildings=exportBuildings(scene);
    const roads=exportRoads(scene);
    if(buildings.count===0)throw new Error('এই মুহূর্তে কোনো OSM building footprint পাওয়া যাচ্ছে না। zoom বাড়িয়ে আবার চেষ্টা করো।');
    const exporter=new GLTFExporter();
    const buffer=await exporter.parseAsync(scene,{binary:true,onlyVisible:true});
    const blob=new Blob([buffer],{type:'model/gltf-binary'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download='Kobe_Futabacho_OSM_3D.glb';document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),60000);
    status('✅ '+buildings.count+' ভবন ও '+roads+' road segments দিয়ে GLB তৈরি হয়েছে');
    message(buildings.estimated+'টি ভবনের height আনুমানিক। Downloads/Files-এ GLB দেখো।',6500);
  }catch(error){
    console.error('GLB export failed:',error);
    status('GLB export হয়নি: '+error.message);
    message('Model export ব্যর্থ হয়েছে; Map-এ আবার zoom করে চেষ্টা করো।',5500);
  }finally{working=false;updateBuildingCount();}
});
