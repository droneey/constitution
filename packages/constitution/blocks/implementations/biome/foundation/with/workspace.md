# Workspace

> Governs the configuration of each package of a workspace.

## General

### biome-configuration-in-the-unit → unit-configuration-kept-in-its-folder · MUST

Each package keeps its configuration in its folder and is checked by a run there: a `biome.jsonc` with `"root": true` that holds the settings of its own blocks; the root's `biome.jsonc` holds the root's and skips the folders the packages lie in.

| Why |
|---|
| a run under a nested configuration starts from the root and loads every `biome.jsonc` below it, past what a package skips or its ignore files leave out, so the root would have to name each package's own files and sandboxes, while a package that is its own root keeps them to itself. |
