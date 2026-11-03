# Pagla Japan — Kobe Futabachō 3D

Live preview: https://mr04nazmul.github.io/Pagla/japan/

## Exact place

- Original user-shared Google Maps place: 真陽市営住宅, 兵庫県神戸市長田区二葉町1丁目6-6
- Scene centre recovered from Google Plus Code M542+8Q Kobe: approximately 34.6558125, 135.1519375.
- The Plus Code precision is about 14 m; this is a scene centre, not a cadastral survey.

## What it is

An interactive reconstruction of mapped building footprints and roads around Futabachō. It does not copy 3D Google Maps imagery.

- iPhone Safari and Android Chrome: MapLibre GL JS shows map-based 3D building extrusions.
- National GSI seamless orthophotos are displayed beneath 3D polygons by default; tap the aerial toggle to hide them.
- Walk, Top and Orbit camera modes and touch joystick.
- The GLB Model button creates an on-device model using currently loaded OSM building outlines and road linework within 250 metres. The GLB is *generated when pressed*; no ready-made GLB is committed.
- Heights unavailable from OSM default to 9.5 m. Models are simplified extruded blocks, not photogrammetric scans.
- Aerial photographs are for on-screen viewing only and are NOT baked into or downloaded with exported GLBs.
- The original Bangladesh Pagla game remains at the repo root.

## Data and attribution

- OpenStreetMap footprints and roads: © OpenStreetMap contributors, ODbL 1.0 — https://www.openstreetmap.org/copyright
- OpenFreeMap vector tile service — https://openfreemap.org/ ; see https://openfreemap.org/tos/
- Japan Geospatial Information Authority (GSI) orthophoto tiles — https://maps.gsi.go.jp/help/use.html and https://maps.gsi.go.jp/help/termsofuse.html
- MapLibre GL JS — https://maplibre.org/
- Three.js and GLTFExporter — https://threejs.org/

OSM-derived models must retain appropriate attribution and comply with applicable ODbL obligations. No Google Maps imagery is copied or extracted into files.

## iPhone steps

1. Visit https://mr04nazmul.github.io/Pagla/japan/ in Safari, tap 3D Area.
2. Use Walk for a lower camera angle and the touch joystick to move; rotate by dragging.
3. Use Top to see the actual aerial picture. Toggle 航空写真 ON/OFF.
4. After mapped building footprints load, tap 3D GLB Model; save the download in Files.

Limitations: A high-angle ortho photo plus simple building solids is not a ground-level photorealistic GTA scene. Accurate facades and characters need separately licensed high-detail 3D assets and original photos. The first version has not yet been visually certified on physical mobile hardware.
