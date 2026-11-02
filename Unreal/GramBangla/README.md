# Pagla — GramBangla | Unreal Engine 5.8

**Project status: Unreal Engine SOURCE STARTER — Unreal Editor build, native executable and photorealistic gameplay have NOT been tested or produced.**

This is the higher-fidelity Unreal Engine branch of the Bangladesh countryside game. The working GitHub Pages browser version stays at [mr04nazmul.github.io/Pagla](https://mr04nazmul.github.io/Pagla/) and is **not** UE5.

## Included in the UE source
- UE5 project and C++ third-person Character, camera, GameMode, WASD movement, mouse camera, Shift sprint, Space jump.
- Procedural **Editor-only** generator: `Content/Python/build_village.py` produces a 300m village foundation with winding dirt road, rice paddies, tin houses, pond, canal, bamboo bridge, tea stalls, trees, decorative CNG auto-rickshaw.
- Lumen / Nanite project settings and color-coded basic PBR materials.

## Run the UE5 source on a supported computer

1. Install **Unreal Engine 5.8** and a C++ compiler supported by UE5.8 (e.g., Visual Studio on Windows). Recommended development memory is **32 GB RAM**, and **8+ GB VRAM**.
2. Open `GramBangla.uproject`, generate/build modules and restart editor if plugins require it. The Python Editor Script Plugin and Editor Scripting Utilities are enabled in the project.
3. From the Unreal Editor choose **Tools → Execute Python Script**, then select `Content/Python/build_village.py`. This creates/saves `/Game/Maps/GramBanglaVillage`.
4. Open the created **GramBanglaVillage** level, press **Play**. Control: **WASD / arrows**, **mouse**, **Space**, **Shift**.
5. Before packaging: **Edit → Project Settings → Maps & Modes → Game Default Map → GramBanglaVillage**. Generated `.umap` and `.uasset` files must be committed separately, ideally with Git LFS.

**WARNING:** Re-running the script in the generated level destroys/replaces all actors labelled with the `GB_` prefix. Save backups of manual scene changes first.

## What needs to change for GTA-style realism

All generated models are **replaceable proxy geometry**; the project currently does not include high-resolution landscape, photogrammetry scans, detailed Bangladesh assets, natural realistic foliage, animation, 3D vehicle physics, NPCs, voice/audio, monsoon weather or missions.

For genuine realism, replace proxy meshes with original/scanned or properly licensed assets, use layered PBR ground materials, real terrain, Nanite where supported, Lumen, lighting art direction, natural vegetation and ambient sound. Asset wishlist: see [ASSET_PLAN.md](ASSET_PLAN.md).

**Browser streaming**: Modern UE5 cannot directly run as static HTML on GitHub Pages. To play Unreal visuals inside mobile browsers use **Pixel Streaming 2**, which needs a separately hosted packaged game on an encoder-capable GPU computer/server. This is not set up and has running costs.

## Validation and caveats

The project files and Python syntax were checked outside Unreal. **Unreal C++ compilation and Python API execution have not been tested in a real UE5 editor here.** Adjust compatibility if the editor shows errors. No gameplay footage is offered as evidence of a finished UE5 build.

Official documentation: [Unreal Engine Python](https://dev.epicgames.com/documentation/unreal-engine/scripting-the-unreal-editor-using-python) · [Hardware requirements](https://dev.epicgames.com/documentation/unreal-engine/hardware-and-software-specifications-for-unreal-engine) · [Pixel Streaming](https://dev.epicgames.com/documentation/unreal-engine/pixel-streaming-in-unreal-engine)
