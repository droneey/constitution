# Workspace

> Governs the configuration of each package of a workspace.

## General

### cruiser-configuration-per-unit → unit-configuration-kept-in-its-folder · MUST

Each package of a workspace has its own configuration, in its folder. It holds the imports the package makes into the other units.

| Why |
|---|
| the settings name the tree from the package's own `src/`, and one configuration for the whole repository would hold every package by one package's settings. |
