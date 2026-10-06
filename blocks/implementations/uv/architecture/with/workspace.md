# uv with workspace

> The members of a uv workspace laid out by the workspace's tree.

### uv-workspace-globbed-by-the-tree → packages-linked-by-workspace-source
`members` lists the globs `packages/*/python` and `libs/*/python`, which match only Python packages, and the path of each unit in Python alone, `packages/<name>`, `libs/<name>` or `shared`.

| Why | Tags |
|---|---|
| uv 0.12 refuses a folder a glob matches without a `pyproject.toml`, another language's package included, unless `exclude` names it, so a glob of `packages/*` would take every product of another language with it, and `exclude`, whose `*` crosses a slash, can drop a language's folder by mistake. | [] |
