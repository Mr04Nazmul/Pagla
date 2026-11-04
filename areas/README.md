# All 16 MRT-6 station-area scenes

Pagla integration of the owner's existing Test-repository 3D assets, pinned to source commit 9aa3c618c7fe68b67e9f6b3fff23e5697ce2070a. This integration adds station selection, source-specific area loading, camera views, rail-aligned train animation and per-area model statistics. It does not claim to have newly surveyed or individually rebuilt every real building.

HD uses each station's OSM2World model (Agargaon has a separate filename), plus the station architecture and neighborhood models. Mobile geometry uses urban and urban-details meshes. Each selection unloads the previous area. Assets are fetched on demand from the owner's public Test repository; initial HD downloads are roughly 16–80 MB per area. Internet and WebGL are required.

Map-derived footprints and alignments come from OpenStreetMap. Dataset freshness and coverage vary; some urban assets combine older snapshot candidates. Roof profiles, facades, colors, unspecified heights, shops, vegetation and street fixtures are illustrative. In the mobile urban models, metadata reports 3,057 footprints, of which 2,914 have inferred heights. These are asset statistics, not a count of surveyed real buildings. Not photogrammetry, survey-grade geometry, actual train GPS or a finished driving simulator.

Attribution: © OpenStreetMap contributors, Open Database License 1.0, https://www.openstreetmap.org/copyright. Original station architecture assets belong to this project and are reference-guided approximations; photographs are not embedded by this integration.

Validation: JS syntax checked; all 96 required model path choices exist in the pinned source checkout. Full interactive browser QA must be confirmed separately; the local Chromium launch is blocked by environment socket restrictions.

Coordinate verification: 109 matching Farmgate OSM building outlines agree with OSM2World X=east, Z=-north to about 0.03 m in bounding-box centers. HD meshes rotate -90 degrees about Y into the shared X=north, Z=east scene. This verifies source alignment only, not real-world survey accuracy.
