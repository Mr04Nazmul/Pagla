# Dhaka Metro MRT-6 — playable 3D train simulator

Mobile-first 3D train driver prototype for GitHub Pages.

- 16 selected current MRT-6 stations with Bengali/English station names in simplified straight-line order.
- Train acceleration and braking, station stops +100 points, keyboard and iPhone touch controls, auto-drive, horn, day/night, free camera / driver camera / follow / top-down view.
- Procedural colored station areas, multi-storey buildings, road traffic, green curved station roofs, elevated viaduct, rail track and overhead equipment.
- Run `index.html` through GitHub Pages. Three.js is fetched from jsDelivr; internet required.
- **Environment geometry is not a photogrammetry scan or geodetically accurate OSM reconstruction.** It is an original visual game prototype. No actual passenger or train GPS.
- The 16 stations are **compressed** into a stylized line for quick playable inspection; the complete actual route alignment, elevation, building facades and catenary details require separately checked GIS data and reference modeling.
- Source is editable in `metro-game.js`; starting work before the replacement remains accessible via git history and the archive branch.

## Controls
- Press-and-hold ACCELERATE / BRAKE, or W / S / Space on keyboard.
- Driver / Follow / Free / Top camera.
- Choose station and Preview to explore.
- Auto drive for automatic stopping.
- H / Horn plays a synthetic test sound.

No personal data collected. Three.js: MIT License.
