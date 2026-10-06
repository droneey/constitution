# Bun with workspace

> A workspace as a Bun workspace.

## workspaces-declared-in-the-root → units-linked-from-the-working-tree
The root `package.json` declares every TypeScript package of the repository in `workspaces`, and no package's manifest declares `workspaces`.

| Why | Check | Tags |
|---|---|---|
| Bun 1.4.2 links a package from the working tree only when the root's `workspaces` lists it, and ignores a `workspaces` field in a package, so the packages it names are never linked. | review | [] |

## own-units-at-workspace-version → units-linked-from-the-working-tree
A unit of the repository is required at `workspace:*`, by another unit or by the root, in `dependencies` and `devDependencies` alike; the root installs so each unit whose configuration it extends.

| Why | Check | Tags |
|---|---|---|
| the importer then takes the working tree, never a published copy, and the root uses a unit's configuration as a consumer does. | tool/versions | [] |

## shared-data-bundled-by-the-build → file-lives-once-across-units
A TypeScript package imports the data it needs at run time from its single source, by a relative path, and ships what `bun build` writes from it, never the source that imports the file.

| Why | Check | Tags |
|---|---|---|
| Bun 1.4.2 parses a YAML or JSON file at import and writes its content into the bundle, so the built package runs without the file, while a published source would import a file its consumer never installs. | review | [] |
