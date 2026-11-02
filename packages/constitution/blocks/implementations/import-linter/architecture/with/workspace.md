# Workspace

> Governs the contracts between the Python units of a workspace, in the root `pyproject.toml`.

## General

### units-blind-by-an-independence-contract → apps-blind-to-each-other · MUST

An `independence` contract keeps the units of `apps/` blind to each other. `[tool.importlinter]` of the root `pyproject.toml` names the import package of every unit that holds Python modules in `root_packages`, and the contract lists those of the units of `apps/`.

| Why |
|---|
| import-linter knows a unit by its import name, not by its folder, so a unit the project does not name goes unchecked; one contract then refuses any import between two of them, and a package of data alone holds no module import-linter 2.15 finds, so naming it fails the contract. |

### units-ordered-by-a-layers-contract → packages-never-import-apps · MUST

A `layers` contract orders the units of `apps/` above those of `packages/`. It sits in the same section and orders their import packages, those of `apps/` separated by `|`, above those of `packages/`, separated by `:`.

| Why |
|---|
| without the order a unit of `packages/` may import an app and change whenever it does; in the contract a lower layer imports no higher one, and the units of a layer split by a bar never import each other while those split by a colon may — the stable dependencies principle. |
