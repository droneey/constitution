# Bun with package

> A repository of packages as a Bun workspace.

## own-packages-as-workspace-dependencies → root-dogfoods-every-package
The root installs the repository's own packages as `workspace:*` development dependencies.

| Why | Check | Tags |
|---|---|---|
| the root then uses each package as a consumer does, from the working tree. | tool — versions | [] |

## workspaces-declared-in-the-root · SHOULD
The root `package.json` is `private` and declares the repository's packages in `workspaces`.

| Why | Check | Tags |
|---|---|---|
| the workspace links every package from the working tree, and the private root can never be published. | review | [] |
