# Workspace

> Governs the configuration of each package of a workspace.

## General

### knip-configuration-per-unit → unit-configuration-kept-in-its-folder · MUST

In a workspace, each package runs knip by a `knip.jsonc` in its own folder. A root that runs knip over its own files leaves the packages to theirs through `ignoreWorkspaces`.

| Why |
|---|
| a run from the root reads every package by the root's configuration, which must then name each package's insides and holds one package to settings written for another; knip run in a package's folder names its entries from the package's own `src/`. |
