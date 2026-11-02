# Workspace

> Governs a workspace as a Bun workspace.

## General

### own-units-linked-from-the-working-tree → workspace-tool-links-units-from-the-working-tree · SHOULD

Bun links every unit of the repository from the working tree. Only the root `package.json` declares `workspaces`, listing every TypeScript package of the repository, and no package's manifest declares the field; a unit is required at `workspace:*` by another unit and by the root, in `dependencies` and `devDependencies` alike, and the root so installs each unit whose configuration it extends.

| Why |
|---|
| Bun 1.4.3 links a package from the working tree only when the root's `workspaces` lists it, and ignores a `workspaces` field in a package, so the packages it names are never linked; a unit required at a version resolves to a published copy, so the importer is tested against code other than the working tree's, and a root that reaches a unit's configuration by a path uses it as no consumer does. |

### shared-data-bundled-by-the-build → file-lives-once-across-units · MUST

A TypeScript package ships the data it reads at run time bundled by `bun build`. It imports that data from its single source, through the entry of the unit that holds it, and ships what `bun build` writes from it, never the source that imports the file.

| Why |
|---|
| Bun 1.4.3 parses a YAML or JSON file at import and writes its content into the bundle, so the built package runs without the file, while a published source would import a file its consumer never installs. |

### install-settings-only-in-the-root → new-release-adopted-after-a-cooldown · MUST

Only the root's `bunfig.toml` holds an `[install]`. It holds that of the whole workspace; no package's `bunfig.toml` holds one.

| Why |
|---|
| Bun 1.4.3 installs the workspace into its one lockfile by the root's `[install]`, from the root and from a package alike, and ignores a package's, so a cooldown written in a package holds nothing while it reads as held. |
