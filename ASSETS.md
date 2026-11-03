# PAGLA v3 — asset register

This project is an original, mobile-friendly Bangladesh-inspired 3D game prototype. It is **not** an AAA-quality photorealistic game. Game logic and rural architecture are original procedural code.

## Runtime GLB models (7 unique models)

These GLB files are loaded at runtime from the provider's permanent HTTPS, CORS-enabled CDN. They are not copied into the repository. The models' published license is **CC0 1.0 Universal** (no attribution legally required; original URLs included here for provenance). Provider: 3DAssets.dev. Their geometry is AI-generated according to the publisher's metadata.

| Content | Direct GLB | Publisher page | Placement |
| --- | --- | --- | --- |
| Banana plant, 2.6 m | https://cdn.3dassets.dev/assets/38579/v1/model.glb | https://3dassets.dev/assets/botanical-glasshouse-and-palm-house-botanical-glasshou-68a0811e | Six village locations |
| Bamboo clump, 3.4 m | https://cdn.3dassets.dev/assets/38590/v1/model.glb | https://3dassets.dev/assets/botanical-glasshouse-and-palm-house-botanical-glasshou-5298b114 | Four village locations |
| Tea stall with kettle and glass rack | https://cdn.3dassets.dev/assets/36551/v1/model.glb | https://3dassets.dev/assets/indian-bazaar-street-and-temple-tea-stall-865b528a | Bazaar |
| Auto rickshaw | https://cdn.3dassets.dev/assets/36560/v1/model.glb | https://3dassets.dev/assets/indian-bazaar-street-and-temple-auto-rickshaw-51b91c47 | Drivable CNG |
| Parked commuter motorcycle | https://cdn.3dassets.dev/assets/36564/v1/model.glb | https://3dassets.dev/assets/indian-bazaar-street-and-temple-parked-motorcycle-d0a13e3f | Roadside |
| Bicycle with carrier | https://cdn.3dassets.dev/assets/36561/v1/model.glb | https://3dassets.dev/assets/indian-bazaar-street-and-temple-bicycle-with-carrier-9d979e52 | Tea stall |
| Fruit and vegetable stall | https://cdn.3dassets.dev/assets/36547/v1/model.glb | https://3dassets.dev/assets/indian-bazaar-street-and-temple-fruit-and-vegetable-st-280ccd20 | Bazaar |
| Fruit and vegetable stall | https://cdn.3dassets.dev/assets/36547/v1/model.glb | https://3dassets.dev/assets/indian-bazaar-street-and-temple-fruit-and-vegetable-st-280ccd20 | Bazaar |

License: https://creativecommons.org/publicdomain/zero/1.0/

The imported models are static except that the published vehicle GLBs include roll animations. Pagla v3 supplies its own in-browser driving movement. The animation clips are **not currently played**; physical wheel rotation is a future improvement.

## Important behavior

- The game uses Three.js ES modules, loading a **version-pinned** Three.js module and GLTFLoader from jsDelivr.
- Runs on GitHub Pages as a static website without servers or API keys.
- On iPhone Safari and Android Chrome, touch joystick drives movement, screen drag rotates the camera, sprint and interaction buttons handle gameplay.
- Walking, the procedural world and a procedural backup CNG remain playable if an optional GLB request fails.
- Third-party CDN / module access needs internet connectivity; if jsDelivr is unreachable the Three.js game itself will not start. Offline play is **not supported**.
- Mobile settings cap pixel ratio and turn off dynamic shadows to protect performance. Actual frame rate varies by device and browser.
- Model presence is confirmed by successful GLTFLoader callbacks, with loading status in the HUD. This is **runtime detection**, not a prior device-level visual QA certification.

## Further realism

Photorealistic rendering requires higher-grade licensed terrain/materials/architecture, more realistic rigged NPCs, animation, improved shadows, lighting, physics and device-specific optimisation. Avoid overstating this prototype as a GTA-like full title.

## Prior game

The previous handcrafted WebGL prototype is still available as `v2.html` and `legacy.html` for comparison.

## Rural village expansion assets (v4 module)

Source: [3DAssets.dev](https://3dassets.dev/docs). License of the five added GLBs: **CC0 1.0 Universal** (publisher's asset pages; no attribution requirement). All assets below are optional network-loaded GLBs; their availability is reflected in the in-game environment asset counter.

| Asset | Direct GLB | Source / visual caveat |
|---|---|---|
| Rice plant (mature, 2.3k tris) | https://cdn.3dassets.dev/assets/19389/v1/model.glb | https://3dassets.dev/assets/cozy-farm-and-homestead-rice-mature-28d8a6a5 ; small planted patches, low-poly |
| Standing man (1.2k tris) | https://cdn.3dassets.dev/assets/36378/v1/model.glb | https://3dassets.dev/assets/low-poly-character-figures-villager-man-bfcdf400 ; static medieval-like tunic; placeholder |
| Standing woman (1.2k tris) | https://cdn.3dassets.dev/assets/36379/v1/model.glb | https://3dassets.dev/assets/low-poly-character-figures-villager-woman-e985e516 ; static tunic figure; placeholder |
| Corrugated roof workshop (692 tris) | https://cdn.3dassets.dev/assets/215/v1/model.glb | https://3dassets.dev/assets/reclamation-yard-open-salvage-workshop ; adapted as market-edge structure |
| Detailed cow (20.1k tris) | https://cdn.3dassets.dev/assets/29184/v1/model.glb | https://3dassets.dev/assets/farm-and-working-animals-hd-dairy-cow-holstein-00db2fd7 ; realistic but static |

Other structures and four moving Bangladeshi-inspired villagers are original procedural geometry in [village-upgrade.js](village-upgrade.js), not third-party model downloads. Houses get original procedural weathered galvanized-tin textures. Mobile rendering keeps rice placement intentionally sparse. No promise of photorealism, native builds or guaranteed FPS on individual phones.

## Reference-look r6 addition (2026-11-03)

Original code in `src/cinematic-reference.js` adds a Bengali tea stall, roadside fencing, rice cards, lotus flowers and a detailed fallback motorbike. It optionally loads an independently verified CC0 motorcycle GLB from Innerscene:

- Source model page: https://www.innerscene.com/tools/library/3d-parts/road-motorcycle-f2519759
- Provider download: https://www.innerscene.com/api/library/road-motorcycle-f2519759/download
- Redirected GLB: https://files.innerscene.com/library/road-motorcycle-f2519759/9dbc8024e2821e098070/motorcycle-original.glb
- License: Public Domain / Creative Commons Zero (CC0); 627KB, real-world scale, static. Browser CORS support and actual mobile GPU appearance have **not** been certified; the game retains geometry fallback.

The look is still a real-time WebGL approximation. Do not imply that low-poly rice textures or procedural houses are photogrammetry or that the reference illustration is a gameplay capture.


## r7 photographed surfaces (2026-11-03)

CC0 sources from Poly Haven, imported as remote, optional **1K JPEG** texture maps. Original source pages:
- https://polyhaven.com/a/leafy_grass
- https://polyhaven.com/a/corrugated_iron
- https://polyhaven.com/a/rusty_corrugated_iron
- https://polyhaven.com/a/red_dirt_mud_01 (prior version, continues to be used for roads)

Their diffuse/normal/roughness variants load asynchronously in `src/photo-materials.js`. If a particular map is unavailable or blocked, the generated local fallback texture stays in place. No API key required. Poly Haven CC0: https://polyhaven.com/license.

`src/natural-foliage.js` and the near-player tea stall/canal geometry are original code with procedurally drawn leaf masks, not scanned photo assets. See `src/cinematic-reference.js` for near-player tea stall, bike and waterside details. The CC0 Innerscene motorcycle asset is still optional; backup mesh remains enabled on failure.

Actual iPhone Safari, Android Chrome, and the remote photographic texture hosts have not yet been certified in a real GPU browser capture.
