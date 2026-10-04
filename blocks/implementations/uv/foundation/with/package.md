# uv with package

> A repository of Python packages as a uv workspace.

## members-linked-by-workspace-source → workspace-packages-linked-locally
The root's `[tool.uv.workspace]` lists the members, and a member that depends on another names it in `[tool.uv.sources]` with `{ workspace = true }`.

| Why | Check | Tags |
|---|---|---|
| the workspace then installs each member from the working tree, and resolves one version of every dependency for all of them. | review | [] |

## uv-build-backend-capped · SHOULD
A package builds with `uv_build`, required in `[build-system]` with a floor and a cap below the next minor: `uv_build>=0.12,<0.13`.

| Why | Check | Tags |
|---|---|---|
| a new minor of the backend may build a different package from the same files; the cap makes that an update someone reviews. | review | [] |
