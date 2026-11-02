"""Construct Bangladeshi village proxy level in Unreal Editor (UE 5.8).
Open Tools > Execute Python Script. Editor-only script, not runtime gameplay.
Rerunning replaces GB_-named proxy actors in the level.
"""
import math
import random
import unreal

RNG = random.Random(24031971)
LEVEL = "/Game/Maps/GramBanglaVillage"
lib = unreal.EditorAssetLibrary
for folder in ("/Game/Maps", "/Game/Materials"):
    if not lib.does_directory_exist(folder):
        lib.make_directory(folder)
subsystem = unreal.get_editor_subsystem(unreal.EditorActorSubsystem)
editor = unreal.get_editor_subsystem(unreal.LevelEditorSubsystem)
if lib.does_asset_exist(LEVEL):
    editor.load_level(LEVEL)
    for a in subsystem.get_all_level_actors():
        if a.get_actor_label().startswith("GB_"):
            subsystem.destroy_actor(a)
else:
    if not editor.new_level(LEVEL):
        raise RuntimeError("Could not create level " + LEVEL)
meshes = {
    "cube": unreal.load_asset("/Engine/BasicShapes/Cube.Cube"),
    "sphere": unreal.load_asset("/Engine/BasicShapes/Sphere.Sphere"),
    "cylinder": unreal.load_asset("/Engine/BasicShapes/Cylinder.Cylinder"),
}
if any(not item for item in meshes.values()):
    raise RuntimeError("Missing built-in Engine BasicShapes")

def mat(name, rgb, roughness=.83, metallic=0.0):
    path = "/Game/Materials/M_" + name
    if lib.does_asset_exist(path):
        return unreal.load_asset(path)
    asset = unreal.AssetToolsHelpers.get_asset_tools().create_asset(
        "M_"+name, "/Game/Materials", unreal.Material, unreal.MaterialFactoryNew())
    color = unreal.MaterialEditingLibrary.create_material_expression(
        asset, unreal.MaterialExpressionConstant3Vector)
    color.set_editor_property("constant", unreal.LinearColor(rgb[0],rgb[1],rgb[2],1.0))
    unreal.MaterialEditingLibrary.connect_material_property(
        color, "", unreal.MaterialProperty.MP_BASE_COLOR)
    rough = unreal.MaterialEditingLibrary.create_material_expression(
        asset, unreal.MaterialExpressionConstant)
    rough.set_editor_property("r", roughness)
    unreal.MaterialEditingLibrary.connect_material_property(
        rough, "", unreal.MaterialProperty.MP_ROUGHNESS)
    if metallic > 0:
        metal = unreal.MaterialEditingLibrary.create_material_expression(
            asset, unreal.MaterialExpressionConstant)
        metal.set_editor_property("r", metallic)
        unreal.MaterialEditingLibrary.connect_material_property(
            metal, "", unreal.MaterialProperty.MP_METALLIC)
    unreal.MaterialEditingLibrary.recompile_material(asset)
    lib.save_loaded_asset(asset)
    return asset

M = {
    "soil": mat("Soil",(.24,.16,.08)),
    "grass":mat("Grass",(.18,.35,.095)),
    "rice":mat("Rice",(.36,.53,.08)),
    "water":mat("Water",(.035,.23,.22),.18,.1),
    "concrete":mat("Concrete",(.43,.41,.35)),
    "brick":mat("Brick",(.48,.24,.14)),
    "tin":mat("TinRoof",(.43,.52,.53),.42,.6),
    "wood":mat("Wood",(.26,.14,.055)),
    "trunk":mat("Trunk",(.23,.115,.035)),
    "leaf":mat("Leaf",(.065,.27,.055)),
    "bamboo":mat("Bamboo",(.62,.58,.21)),
    "white":mat("Plaster",(.67,.65,.53)),
    "black":mat("Rubber",(.017,.02,.019)),
}
COUNT = 0

def spawn(label, shape, x,y,z, sx,sy,sz, color, pitch=0, yaw=0, roll=0):
    global COUNT
    actor = subsystem.spawn_actor_from_class(
        unreal.StaticMeshActor,
        unreal.Vector(x,y,z),
        unreal.Rotator(pitch,yaw,roll))
    if not actor:
        raise RuntimeError("Could not spawn "+label)
    actor.set_actor_label("GB_"+label+"_"+str(COUNT))
    comp=actor.get_component_by_class(unreal.StaticMeshComponent)
    comp.set_static_mesh(meshes[shape])
    comp.set_material(0,M[color])
    actor.set_actor_scale3d(unreal.Vector(sx/100.,sy/100.,sz/100.))
    COUNT+=1
    return actor

def box(label,x,y,z,sx,sy,sz,color,pitch=0,yaw=0,roll=0):
    return spawn(label,"cube",x,y,z,sx,sy,sz,color,pitch,yaw,roll)

# 300 m rural scene with a 300 m winding dirt road.
box("ground",0,0,-95,31000,31000,170,"grass")
for i in range(-10,11):
    y=i*1400
    x=120*math.sin(i*.42)
    box("dirt_road",x,y,0,490+(i%3)*30,1460,13,
        "soil",yaw=3.5*math.cos(i*.42))

# Rice paddies, with low mud bunds.
for ix in range(-5,6):
    if ix in (-1,0):
        continue
    for iy in range(-5,6):
        x=ix*2250+460
        y=iy*2500+120
        if -5400<y<-900 and 2700<x<9500:
            continue
        if (ix,iy) in ((2,3),(-2,-3),(-4,0),(4,4)):
            continue
        box("rice_field",x,y,2,1930,2200,13,"rice")
        box("mud_bund",x,y+1120,18,2010,45,28,"soil")
        if (ix+iy)%3==0:
            for j in range(7):
                box("rice_rows",x-800+j*255,y,13,23,2070,20,"grass")

def tree(x,y,scale=1.0):
    h=RNG.uniform(500,760)*scale
    spawn("trunk","cylinder",x,y,h*.43,
          72*scale,72*scale,h*.84,"trunk")
    for ox,oy,oz,r in ((-145,0,.86,390),(140,45,.9,350),
                       (0,-145,.97,365),(0,40,1.06,330)):
        spawn("foliage","sphere",x+ox*scale,y+oy*scale,h*oz,
              r*scale,r*scale,r*.75*scale,"leaf")

def house(x,y):
    box("house_plinth",x,y,48,660,920,95,"brick")
    box("house_wall",x,y,290,615,840,380,"white")
    for dx,pitch in ((-170,-22),(170,22)):
        box("sloped_tin_roof",x+dx,y,555,405,1010,35,"tin",pitch=pitch)
    box("wood_door",x,y-429,240,130,23,270,"wood")
    box("window",x+225,y-431,320,110,25,120,"black")
    for pole in (-400,400):
        box("bamboo_pole",x+pole,y-520,235,44,44,470,"bamboo")

# Pond, ghat, houses, roadside tea stalls and bamboo footbridge.
box("pond_bed",6500,-3050,-25,7700,4400,17,"soil")
box("pond_water",6500,-3050,-7,7400,4050,10,"water")
for i in range(5):
    box("pond_steps",2900+i*82,-3000,7+i*7,76,680,26,"concrete")
for x,y in ((-4150,-7800),(-4600,4800),(5200,8000),
            (9900,2800),(-8300,-1000)):
    house(x,y)
for i,x in enumerate((-2800,3500)):
    y=11400+i*120
    box("market_shop",x,y,235,510,515,460,"brick")
    box("market_roof",x,y,495,620,610,40,"tin")
    box("tea_counter",x,y-365,130,430,105,175,"wood")
    for d in (-190,190):
        box("stool",x+d,y-730,95,135,135,50,"wood")
box("canal",-10500,-3500,-23,3300,19000,11,"water")
for i in range(-4,5):
    box("footbridge",-10500+i*350,-3800,80,305,900,45,"bamboo")
for x in (-11900,-9100):
    box("footbridge_rail",x,-3800,200,45,1000,45,"bamboo")
for _ in range(34):
    y=RNG.uniform(-12500,12100)
    x=RNG.choice((-1,1))*RNG.uniform(1800,13400)
    if 2000<x<10800 and -5500<y<0:
        continue
    tree(x,y,RNG.uniform(.65,1.25))

# Decorative CNG proxy: not yet equipped with driving physics.
box("cng_body",1050,-12000,210,300,440,250,"grass")
box("cng_roof",1050,-12000,345,370,490,34,"black")
for dx,dy in ((-160,200),(160,200),(0,-200)):
    spawn("cng_wheel","cylinder",1050+dx,-12000+dy,75,
          130,130,65,"black",roll=90)

def light(label,klass,location,rotation=None):
    actor=subsystem.spawn_actor_from_class(
        klass,unreal.Vector(*location),rotation or unreal.Rotator())
    actor.set_actor_label("GB_"+label)
    return actor

light("sun",unreal.DirectionalLight,(0,0,8500),
      unreal.Rotator(-35,-65,0))
light("skylight",unreal.SkyLight,(0,0,0))
light("fog",unreal.ExponentialHeightFog,(0,0,0))
light("sky_atmosphere",unreal.SkyAtmosphere,(0,0,0))
light("start",unreal.PlayerStart,(50,-13000,170))
if not editor.save_current_level():
    raise RuntimeError("Could not save generated village")
print("GramBangla saved!",LEVEL,COUNT,"actors")
print("WASD to move, mouse camera, Space jump, Shift sprint.")
print("Proxy materials: upgrade to licensed PBR textures and realistic assets.")
