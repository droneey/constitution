# Bun with workspace

> A workspace as a Bun workspace.

## workspaces-declared-in-the-root → units-linked-from-the-working-tree
The root `package.json` declares the repository's units in `workspaces`.

| Why | Check | Tags |
|---|---|---|
| Bun links a unit from the working tree only when the root's `workspaces` lists it. | review | [] |

## own-units-at-workspace-version → units-linked-from-the-working-tree
A unit of the repository is required at `workspace:*`, by another unit or by the root, in `dependencies` and `devDependencies` alike; the root installs so each unit whose configuration it extends.

| Why | Check | Tags |
|---|---|---|
| the importer then takes the working tree, never a published copy, and the root uses a unit's configuration as a consumer does. | tool/versions | [] |
