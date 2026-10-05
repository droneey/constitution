# Bun with workspace

> A workspace as a Bun workspace.

## workspaces-declared-in-the-root → units-linked-from-the-working-tree
The root `package.json` declares the repository's units in `workspaces`.

| Why | Check | Tags |
|---|---|---|
| Bun links a unit from the working tree only when the root's `workspaces` lists it. | review | [] |

## own-units-at-workspace-version → units-linked-from-the-working-tree
A unit of the repository is required at `workspace:*`.

| Why | Check | Tags |
|---|---|---|
| the importer then takes the working tree, never a published copy. | tool/versions | [] |
