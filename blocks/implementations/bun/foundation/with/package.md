# Bun with package

> A repository of packages as a Bun workspace.

## own-packages-as-workspace-dependencies → root-dogfoods-every-package
The root installs the repository's own packages as `workspace:*` development dependencies.

| Why | Check | Tags |
|---|---|---|
| the root then uses each package as a consumer does, from the working tree. | review | [] |

## own-packages-at-workspace-version → own-packages-as-workspace-dependencies
An own package is required at `workspace:*`.

| Why | Check | Tags |
|---|---|---|
| the root then takes the working tree, never a published copy. | tool/versions | [] |

## workspaces-declared-in-the-root · SHOULD
The root `package.json` is `private` and declares the repository's packages in `workspaces`.

| Why | Check | Tags |
|---|---|---|
| the workspace links every package from the working tree, and the private root can never be published. | review | [] |
