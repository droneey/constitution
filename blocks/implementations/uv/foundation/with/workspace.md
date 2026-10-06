# uv with workspace

> A workspace of Python units as a uv workspace.

## members-linked-by-workspace-source → units-linked-from-the-working-tree
The root's `[tool.uv.workspace]` lists the members, and a member that depends on another names it in `[tool.uv.sources]` with `{ workspace = true }`.

| Why | Check | Tags |
|---|---|---|
| the workspace then installs each member from the working tree, and resolves one version of every dependency for all of them. | review | [] |

## one-lock-for-the-workspace → one-version-per-dependency
`uv.lock` resolves one version of each dependency for the root and every member of its workspace.

| Why | Check | Tags |
|---|---|---|
| uv resolves the workspace as one whole, so a second version of a dependency cannot enter while every manifest is a member. | review | [] |
