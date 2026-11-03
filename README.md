# Pagla — গ্রামবাংলা Open World 3D 🇧🇩

**Playable v3 browser game:** https://mr04nazmul.github.io/Pagla/  
**Source:** [index.html](index.html), [game-v3.js](game-v3.js)  
**Asset sources and licenses:** [ASSETS.md](ASSETS.md)  
**Previous WebGL prototype:** [v2.html](v2.html)

## Current web-game build

- Three.js v0.180.0 mobile-oriented rendering and GLTFLoader for 7 **CC0 GLB** model types (banana, bamboo, tea stall, auto rickshaw, motorcycle, bicycle, produce stall).
- Bangladesh-inspired 3D village with custom textured dirt road, rural tin-roof houses, fields, pond, road props and map.
- Touch joystick, swipe camera, sprint, drivable auto rickshaw, three destination objectives.
- iPhone Safari / Android Chrome targeting, capped mobile pixel ratio, optional 3D asset fallback.
- **Realism limit:** this is an early playable mobile **prototype, not photorealistic GTA graphics**. Character/environment meshes are still largely procedural. Gameplay and page source are published; on-device GPU visual QA is not yet confirmed. 3D models depend on external CDN connectivity, and internet is required.

---

## Archived v2 notes

# Pagla — গ্রামবাংলা 3D 🇧🇩

A **playable 3D browser-game prototype** inspired by the rural villages of Bangladesh. Open the website in a WebGL-capable browser and press **খেলা শুরু করো**.

## Play

GitHub Pages: https://mr04nazmul.github.io/Pagla/

## Browser visual update (2026-11-03)

The root `index.html` is now **v2**. A saved copy of the original is `legacy.html`, and `v2.html` is kept for comparison.

**Implemented in v2:** improved shaded/noisy terrain, darker rural colors, puddles, more roof detailing, bamboo fences, extra grass/soil detail, cinematic lower camera, and an original procedural adult civilian character with rounded head, facial features, clothing, and animated arms/legs when walking.

**Reality check:** the browser version is still a **stylized/procedural WebGL prototype, NOT photorealism**. High-end realism requires licensed realistic 3D human/foliage/environment assets and a true 3D game-asset pipeline (see the Unreal Engine 5 source project). A JavaScript runtime/gameplay test passed with a mocked graphics driver; GPU rendering couldn't be visually verified in the test environment.

## Gameplay

- Walk around a stylized Bangladeshi village, including dirt roads, village houses, a pond, crops, trees, and local shops.
- Explore three locations to complete the introductory objectives: village home, pond, and bazaar.
- Walk up to the CNG auto-rickshaw and press **F** or the on-screen action button to drive it.
- Mini-map and live mission HUD.

## Controls

| Platform | Move | Camera | Interaction |
| --- | --- | --- | --- |
| Desktop | WASD / arrow keys | Mouse drag | F, when near vehicle |
| Mobile | Virtual joystick | Drag on screen | Action button |

Shift or the on-screen run button to move faster while on foot.

## Technical

- Single-file HTML, CSS, JavaScript and handcrafted **WebGL** rendering.
- No server, API keys, database, or build step.
- Serve `index.html` with any static hosting service (GitHub Pages, Vercel, etc.).
- Works best in up-to-date browsers with WebGL enabled.

## Development

This is **an early low-poly playable prototype**, not a GTA-like photorealistic game. The village is fictional, inspired by Bangladesh; it does not claim precise real-world geography. This repo contains the source game. GitHub Pages publishes the static files directly from the `main` branch (repository root).

### Roadmap

- More realistic rural assets / materials / lighting.
- NPC pedestrians and Bangla interactions.
- Better vehicle physics, sounds and traffic.
- More missions and Android performance optimization.

## License

All rights reserved by repository owner unless an explicit license is added.


## Unreal Engine 5 — realistic countryside edition (work in progress)

The UE5 source project is now in [Unreal/GramBangla](Unreal/GramBangla/README.md). It includes a C++ third-person movement prototype and an editor-only Python script to generate a rural Bangladesh blockout (tin houses, paddy fields, pond, market, footbridge and dirt road). It is **not** compiled or yet photorealistic.

**Important:** Unreal Engine cannot run directly on GitHub Pages; the browser game here remains the WebGL prototype. Running high-fidelity UE5 in a mobile browser requires a packaged UE5 game plus a GPU-hosted Pixel Streaming service.
