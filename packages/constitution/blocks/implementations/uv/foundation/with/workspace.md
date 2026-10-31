# Workspace

> Governs a workspace of Python units as a uv workspace.

## General

### workspace-root-has-no-project → root-and-internal-units-private · MUST

The root `pyproject.toml` of a uv workspace has no `[project]` table.

| Why |
|---|
| uv then takes the root as the workspace alone, with no package of its own to lock, build or publish. |

### packages-linked-by-workspace-source → workspace-tool-links-units-from-the-working-tree · SHOULD

The root's `[tool.uv.workspace]` lists every Python package of the repository in `members`, and a package that depends on another names it in `[tool.uv.sources]` with `{ workspace = true }`; no package's `pyproject.toml` holds a `[tool.uv.workspace]`.

| Why |
|---|
| uv 0.13 installs each listed package from the working tree and resolves one version of every dependency for all of them, and refuses a workspace nested in a package. |

### shared-data-read-through-its-package → file-lives-once-across-units · MUST

A Python package takes the data it needs at run time from the package of its group that holds the data its languages share, by naming it in its dependencies, `{ workspace = true }` in `[tool.uv.sources]`. That package holds the data alone, as a namespace package under its root: `module-root = ""` and `namespace = true` under `[tool.uv.build-backend]`, its `schema/` and `conformance/` inside the folder of its import package's name.

| Why |
|---|
| uv_build 0.13 refuses a path outside the project, so the data cannot enter the package's wheel and ships as the wheel of a package of its own, installed beside it; a namespace package needs no `__init__.py`, so that package holds no Python, and its wheel holds the folder of the data alone, whatever else its root holds. |
