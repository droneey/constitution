# dependency-cruiser with workspace

> The configuration of each package of a workspace.

### cruiser-configuration-per-unit → unit-checked-by-its-own-parts
In a workspace, each package has a configuration of its own, in its folder, that extends the parts of its blocks.

| Why | Tags |
|---|---|
| the parts name the tree from the package's own `src/`, and one configuration for the whole repository would hold every package by one package's parts. | [] |
