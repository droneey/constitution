# Workspace

> Governs a workspace of Python units as a uv workspace.

## General

### workspace-root-has-no-project → root-and-internal-units-private · MUST

The root `pyproject.toml` of a uv workspace has no `[project]` table.

| Why |
|---|
| a root with a `[project]` table is a package uv locks, builds and can publish, with whatever the root holds. |

### packages-linked-by-workspace-source → workspace-tool-links-units-from-the-working-tree · SHOULD

Every Python package is a member of the root's uv workspace. The root's `[tool.uv.workspace]` lists every Python package of the repository in `members`, a package that depends on another names it in `[tool.uv.sources]` with `{ workspace = true }`, and no package's `pyproject.toml` holds a `[tool.uv.workspace]`.

| Why |
|---|
| a package left out of `members`, or named without `{ workspace = true }`, is installed from the registry instead of the working tree, so a change to it is not tested by its users before it is published; uv 0.13 resolves one version of every dependency for all the members and refuses a workspace nested in a package. |

### shared-data-read-through-its-package → file-lives-once-across-units · MUST

A Python package takes the shared data it needs at run time from its group's package of data, as a dependency. It names that package in its dependencies, `{ workspace = true }` in `[tool.uv.sources]`, and that package holds the data alone, as a namespace package under its root: `module-root = ""` and `namespace = true` under `[tool.uv.build-backend]`, its `schema/` and `conformance/` inside the folder of its import package's name.

| Why |
|---|
| uv_build 0.13 refuses a path outside the project, so data read by path cannot enter the package's wheel and is missing once the package is installed; it ships as the wheel of a package of its own, installed beside it, and a namespace package needs no `__init__.py`, so that package holds no Python and its wheel holds the folder of the data alone, whatever else its root holds. |
