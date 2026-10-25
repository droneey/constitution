# Workspace

> Governs the contracts between the Python units of a workspace, in the root `pyproject.toml`.

## General

### units-blind-by-an-independence-contract → apps-blind-to-each-other · MUST

`[tool.importlinter]` of the root `pyproject.toml` names the import package of every unit in `root_packages`, and an `independence` contract lists those of the units of `apps/`.

| Why |
|---|
| import-linter knows a unit by its import name, not by its folder, so the project names them; one contract then refuses any import between two of them. |

### units-ordered-by-a-layers-contract → packages-never-import-apps · MUST

A `layers` contract of the same section orders the import packages of the units of `apps/`, separated by `|`, above those of `packages/`, separated by `:`.

| Why |
|---|
| a lower layer imports no higher one, and the units of a layer split by a bar never import each other while those split by a colon may. |
