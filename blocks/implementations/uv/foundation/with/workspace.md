# uv with workspace

> A workspace of Python units as a uv workspace.

## members-linked-by-workspace-source → units-linked-from-the-working-tree
The root's `[tool.uv.workspace]` lists the members, and a member that depends on another names it in `[tool.uv.sources]` with `{ workspace = true }`.

| Why | Check | Tags |
|---|---|---|
| the workspace then installs each member from the working tree, and resolves one version of every dependency for all of them. | review | [] |
