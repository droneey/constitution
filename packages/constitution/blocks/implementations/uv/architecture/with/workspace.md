# Workspace

> Governs the members of a uv workspace laid out by the workspace's tree.

## General

### uv-workspace-globbed-by-the-tree · SHOULD

`members` lists the globs `apps/*/languages/python` and `packages/*/languages/python`, which match only Python packages, and the path of each unit in Python alone, `apps/<name>` or `packages/<name>`.

| Why | Tags |
|---|---|
| uv 0.13 refuses a folder a glob matches without a `pyproject.toml`, another language's package included, unless `exclude` names it, so a glob of `apps/*` would take every app of another language with it, and `exclude`, whose `*` crosses a slash, can drop a language's folder by mistake. | [] |
