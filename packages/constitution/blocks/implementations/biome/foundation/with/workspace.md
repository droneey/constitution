# Workspace

> Governs the configuration of each package of a workspace.

## General

### biome-configuration-in-the-unit → unit-configuration-kept-in-its-folder · MUST

A package with parts of its own keeps its configuration in its folder and is checked by a run there: a `biome.json` with `"root": true` that extends the shared parts and its own through `.droneey/constitution`, a committed relative link to the root's; the root's `biome.json` extends the shared parts alone and skips the folders the packages lie in.

| Why |
|---|
| a run under a nested configuration starts from the root and loads every `biome.json` below it, past what a package skips or its ignore files leave out, so the root would have to name each package's templates and sandboxes, while a package that is its own root keeps them to itself. |
