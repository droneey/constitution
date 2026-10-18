# Biome with workspace

> The configuration of each package of a workspace.

### biome-configuration-in-the-unit → unit-checked-by-its-own-tools · MUST

A package with parts of its own keeps its configuration in its folder: a `biome.json` with `"root": false` that extends the shared parts and its own through `.droneey/constitution`, a committed relative link to the root's; the root's `biome.json` extends the shared parts alone.

| Why | Tags |
|---|---|
| Biome reads a plugin's path from the configuration that extends it and checks each file by the nearest configuration, so one run from the root holds each package to its own parts, and a package moved to a repository of its own takes the list of its parts with it. | [] |
