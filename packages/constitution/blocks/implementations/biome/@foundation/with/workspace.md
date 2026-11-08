# Workspace

> Governs the configuration of each package of a workspace.

## General

### biome-package-config-is-a-root → unit-checked-by-its-own-tools · MUST

Every package's `biome.jsonc` sets `"root": true` and holds the settings of its own blocks. The root's `biome.jsonc` holds the root's settings and skips the folders the packages lie in.

| Why |
|---|
| a run under a nested configuration that extends the root's starts from the root and loads every `biome.jsonc` below it, past what a package skips or its ignore files leave out, so the root would have to name each package's own files and sandboxes, while a package that is its own root keeps them to itself. |
