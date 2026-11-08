# Workspace

> Governs a workspace as a Bun workspace: its globs, its links, the data it ships and its install settings.

## General

### workspaces-globbed-by-the-tree → root-holds-one-workspace-per-language · MUST

The root's `workspaces` globs every package folder of the tree. It lists `apps/*` and `packages/*`, and for each group folder the glob of its packages, `apps/<group>/*` or `packages/<group>/*`.

| Why |
|---|
| Bun links only what the root's `workspaces` lists and ignores a `workspaces` field in a package; it skips a folder a glob matches without a `package.json`, so these globs take every package with one, alone or in a group, and pass over the group folders and the other languages' packages, while a path without a `package.json` fails the install, and a glob of two folders everywhere, `packages/*/*`, would take a folder inside a package that holds one. |

### packages-required-at-workspace-caret → own-package-resolved-from-the-working-tree · MUST

Every package of the repository is linked by Bun from the working tree. Every other package and the root that require it name it at `workspace:^`, in `dependencies` and `devDependencies` alike.

| Why |
|---|
| a package required at a version resolves to a published copy, so the importer is tested against code other than the working tree's; one specifier for both kinds keeps one version of the package across the manifests, and `workspace:^` is packed as a caret range. |

### root-installs-each-package-it-extends → own-package-resolved-from-the-working-tree · MUST

The root installs as a dependency each package whose configuration it extends, never reaching it by a path.

| Why |
|---|
| a root that reaches a package's configuration by a path uses it as no consumer does, so what the root checks is not what a consumer gets. |

### shared-data-bundled-by-the-build → file-lives-once-across-units · MUST

Every TypeScript package whose build no other active block owns ships the data it reads at run time bundled by `bun build`. It ships what `bun build` writes from the data's single source, never the source that imports the file.

| Why |
|---|
| Bun parses a YAML or JSON file at import and writes its content into the bundle, so the built package runs without the file, while a published source would import a file its consumer never installs. |

### install-settings-only-in-the-root → new-release-adopted-after-a-cooldown · MUST

Only the root's `bunfig.toml` sets the cooldown; no package's does.

| Why |
|---|
| Bun installs the whole workspace into its one lockfile, from the root and from a package alike, so the cooldown is the workspace's, and one written in a package reads as held where nothing documents that the install reads it. |
