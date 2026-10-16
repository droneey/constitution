# uv with workspace

> The members of a uv workspace laid out by the workspace's tree.

### uv-workspace-globbed-by-the-tree · SHOULD

`members` lists the globs `products/*/languages/python`, `shared/*/languages/python` and `libs/*/languages/python`, which match only Python packages, and the path of each unit in Python alone, `products/<name>`, `shared/<name>` or `libs/<name>`.

| Why | Tags |
|---|---|
| uv 0.12 refuses a folder a glob matches without a `pyproject.toml`, another language's package included, unless `exclude` names it, so a glob of `products/*` would take every product of another language with it, and `exclude`, whose `*` crosses a slash, can drop a language's folder by mistake. | [] |
