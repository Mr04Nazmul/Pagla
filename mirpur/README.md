# Mirpur Drive mode in Pagla

Original: https://github.com/kolinabir/Mirpur-Drive
Creator: Abir Kolin. MIT License; retained in LICENSE.txt.
Pinned upstream source: 3e6fe746169279e2a80058e561cbf9601d4599b7.

This is an adaptation of the existing Mirpur Drive game, not an independently created reconstruction. It covers the upstream districts: Mirpur/Pallabi/Uttara South and Agargaon/Bijoy Sarani/Farmgate. It does not cover all 16 MRT-6 station neighborhoods.

Built with npm ci --ignore-scripts --no-audit --no-fund and npm run build -- --base=/Pagla/mirpur/. Adaptation changes only base URLs: textures, car models, decoder, district scenes and map data load from the pinned upstream public directory. JS/CSS entry bundles are served locally. integration.patch records those source modifications. Other models/datasets retain their upstream attribution; OpenStreetMap data is © OpenStreetMap contributors under ODbL. See upstream public assets for their own notices.

The upstream build succeeds. A browser gameplay/FPS verification has not been completed here: the available browser reports WebGL disabled. Do not claim verified phone performance or photographic fidelity.

Source reproduction: clone upstream at the exact commit, git apply integration.patch, npm ci, then npm run build -- --base=/Pagla/mirpur/. Copy dist entry and assets; scene/model/texture URLs remain pinned externally, so internet is required.
