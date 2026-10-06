# Biome with workspace

> The configuration of each unit of a workspace.

## configuration-per-unit-at-the-root → unit-checked-by-its-own-parts
A unit with parts of its own has its configuration in the repository's root, `biome.<name>.jsonc` — `<name>` the unit's whole path from the root with its slashes as hyphens, `biome.packages-web.jsonc` — which extends the shared parts and its own; its check runs `biome check --config-path=biome.<name>.jsonc <its folder>`, and `biome.json` leaves that folder out of `files.includes`.

| Why | Check | Tags |
|---|---|---|
| Biome reads a plugin's path from the configuration at the top, so a configuration inside the application's folder cannot load the presets' plugins, and a nested one that extends the root's takes no other file; a name from the whole path keeps apart two units whose folders end in the same name. | review | [] |
