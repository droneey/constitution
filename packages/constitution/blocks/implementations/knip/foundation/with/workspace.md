# Workspace

> Governs the configuration of each package of a workspace.

## General

### knip-configuration-per-unit → unit-configuration-kept-in-its-folder · MUST

In a workspace, each package runs knip by a `knip.jsonc` in its folder; a root that runs knip over its own files leaves the packages to theirs through `ignoreWorkspaces`.

| Why |
|---|
| knip run in a package's folder reads the package by its own settings, its entries named from its own `src/`; a run from the root would read every package by the root's configuration, which then names each package's insides. |
