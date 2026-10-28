# Workspace

> Governs the members of a uv workspace laid out by the workspace's tree.

## General

### uv-workspace-globbed-by-the-tree · SHOULD

`members` lists the glob `packages/*/python`, which matches only the Python package of each group, and the path of every other Python package: an app, `apps/<name>` or `apps/<group>/<name>`, a package in Python alone, `packages/<name>`, and a group's `shared/` that a Python package reads, `packages/<group>/shared`.

| Why |
|---|
| uv 0.13 refuses a folder a glob matches without a `pyproject.toml`, another language's package included, unless `exclude` names it, so a glob of `apps/*` or `packages/<group>/*` would take every package of another language with it, and `exclude`, whose `*` crosses a slash, can drop a language's folder by mistake. |
