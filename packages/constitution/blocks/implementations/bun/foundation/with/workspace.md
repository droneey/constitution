# Workspace

> Governs a workspace as a Bun workspace.

## General

### workspaces-declared-in-the-root → workspace-tool-links-units-from-the-working-tree · SHOULD

The root `package.json` declares every TypeScript package of the repository in `workspaces`, and no package's manifest declares `workspaces`.

| Why |
|---|
| Bun 1.4.3 links a package from the working tree only when the root's `workspaces` lists it, and ignores a `workspaces` field in a package, so the packages it names are never linked. |

### own-units-at-workspace-version → workspace-tool-links-units-from-the-working-tree · SHOULD

A unit of the repository is required at `workspace:*`, by another unit or by the root, in `dependencies` and `devDependencies` alike; the root installs so each unit whose configuration it extends.

| Why |
|---|
| the importer then takes the working tree, never a published copy, and the root uses a unit's configuration as a consumer does. |

### shared-data-bundled-by-the-build → file-lives-once-across-units · MUST

A TypeScript package imports the data it needs at run time from its single source, by a relative path, and ships what `bun build` writes from it, never the source that imports the file.

| Why |
|---|
| Bun 1.4.3 parses a YAML or JSON file at import and writes its content into the bundle, so the built package runs without the file, while a published source would import a file its consumer never installs. |

### install-settings-only-in-the-root → new-release-adopted-after-a-cooldown · MUST

The root's `bunfig.toml` holds the `[install]` of the whole workspace; no package's `bunfig.toml` holds an `[install]`.

| Why |
|---|
| Bun 1.4.3 installs the workspace into its one lockfile by the root's `[install]`, from the root and from a package alike, and ignores a package's, so a cooldown written in a package holds nothing while it reads as held. |
