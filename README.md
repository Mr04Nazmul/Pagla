# Pagla — গ্রামবাংলার 3D অভিযান 🇧🇩

A **playable mobile-first 3D village exploration game** that works in iPhone Safari and Android Chrome with WebGL. This repository serves a static game via GitHub Pages: https://mr04nazmul.github.io/Pagla/

## November 2026 Three.js / glTF upgrade

- **Real `GLTFLoader` integration** for seven CC0 `.glb` models from 3DAssets.dev (banana, bamboo, tea stall, bicycle, motorcycle, CNG/auto-rickshaw, charpoy). Each is rendered in the world, with exact asset URLs, verified asset pages, and licence information in [`assets/CREDITS.md`](assets/CREDITS.md). The GLB files are streamed over an official CORS-enabled CDN, not checked into Git. Their embedded textures are used directly.
- Replaced handcrafted WebGL rendering on the root landing page with a pinned **Three.js** ES module/import-map and physically based materials. The original browser version remains available at [`legacy.html`](legacy.html), and comparison version at `v2.html`.
- Curved dirt road with procedural texture, rice field instancing, real-world-scale tin-roof village houses, wet patches, pond, bamboo fences, electric poles and wires, atmospheric fog, daylight, and multiple village props.
- Animated third-person character, on-foot walking and sprinting, 3-step exploration mission, minimap, **enter/drive/exit CNG**, perspective drag and camera cycling.
- Mobile pointer-captured virtual joystick, touch camera, on-screen controls, iOS safe-area HUD, WebGL renderer quality setting, bounded DPR, low-power mode, basic FPS display and automatic quality reduction under sustained low FPS.
- `manifest.webmanifest` and SVG icon for add-to-home-screen affordances. This is **not an offline PWA**, because Third-party CDN JS/GLB resources require network access.

### How to play

1. Open https://mr04nazmul.github.io/Pagla/ using Safari on iPhone or Chrome on Android (landscape mode recommended).
2. Tap **খেলা শুরু করো**, steer with the joystick, swipe/drag the world to rotate the camera. **দৌড়** = sprint. **উঠো** near the CNG = drive; **নামো** = exit.
3. Complete the three destinations (house, pond, tea stall) as marked on the minimap.

Desktop controls: `W/A/S/D` or arrow keys to move, drag the world with the mouse to look around, `Shift` to sprint, `F` to enter/exit CNG.

### Files

- `index.html` — mobile UI, splash screen, pinned import map.
- `src/game.js` — Three.js world, lighting, material geometry, player, joystick and missions, renderer and runtime model integration.
- `src/asset-manifest.js` — CC0 model links, known dimensions, mission data.
- `assets/CREDITS.md` — direct model source and licence list.
- `assets/icon.svg`, `manifest.webmanifest` — home-screen icon and metadata.
- `legacy.html`, `v2.html` — older playable prototypes for fallback/comparison.
- `Unreal/GramBangla/` — separate UE5 prototype for desktop future work (not supported by GitHub Pages hosting).

### Development / deployment

Static hosting only; **no server, cloud database, credentials, paid APIs or build step**. GitHub Pages publishes root `index.html` from `main`. All imports are root-relative or project-relative, so the same code works under `/Pagla/`.

To test locally, run a static web server such as `python3 -m http.server 8080` in the repository root. Launch the served URL in a current browser. The web page must be served over HTTP(S), not `file://`, for ES modules and GLBs.

### Quality and verification notes

This is **a playable 3D browser prototype with third-party GLB assets; it is not GTA V or photo-realistic AAA rendering**. The model thumbnails and pages are verified for their licences and source URLs, but actual iPhone Safari/Android Chrome GPU screenshots and cross-device FPS must be tested on real phones. The CNG follows direct game controls with simplified vehicle physics; no road AI, advanced collisions, NPCs or engine audio yet. The browser must be online for the CDN resources.

When new CC BY assets are used in the future, add exact author, title, source link, license link and any changes here; do not omit attribution. Right now this integration only uses CC0 external models.

## Ownership

Original game code and layout belong to the Pagla repository owner. External packages and 3D asset licensing are separately recorded in [`assets/CREDITS.md`](assets/CREDITS.md). All rights reserved for original project content unless separately licensed.
