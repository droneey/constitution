# Bun with package

> A repository of packages as a Bun workspace.

## own-packages-as-workspace-dependencies → root-dogfoods-every-package
The root installs the repository's own packages as `workspace:*` development dependencies.

| Why | Check | Tags |
|---|---|---|
| the root then uses each package as a consumer does, from the working tree. | review | [] |

## own-packages-at-workspace-version → workspace-packages-linked-locally
An own package is required at `workspace:*`.

| Why | Check | Tags |
|---|---|---|
| the root then takes the working tree, never a published copy. | tool/versions | [] |

## workspaces-declared-in-the-root → workspace-packages-linked-locally
The root `package.json` declares the repository's packages in `workspaces`.

| Why | Check | Tags |
|---|---|---|
| Bun links a package from the working tree only when the root's `workspaces` lists it. | review | [] |
