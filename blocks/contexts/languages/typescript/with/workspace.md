# TypeScript with workspace

> Governs the manifests of a TypeScript workspace and how its packages are compiled.

## Workspace

### root-manifest-private → root-and-internal-units-private · MUST
The root `package.json` of a workspace sets `"private": true`.

| Why | Tags |
|---|---|
| a package manager refuses to publish a manifest marked private, so the root can never be published by mistake. | [] |

### unit-compiled-by-its-own-options → unit-checked-by-its-own-tools · MUST
Each package is compiled with its own compiler options alone: a package that imports another is checked against the declarations of the other's entries, never against the other's source compiled with its own options.

| Why | Tags |
|---|---|
| the compiler applies the options and the `paths` of the program it checks to every file it compiles, so the imported package's `#/` would resolve into the importer's `src/`, and an option the importer turns on would fail in a file the importer does not own. | [] |

### own-unit-linked-from-the-working-tree → workspace-tool-links-units-from-the-working-tree · SHOULD
A unit of the repository in another unit's dependencies is linked from the working tree, never pinned to a version.

| Why | Tags |
|---|---|
| a unit changes with the repository it lives in, so the version it is required at names the working tree, not a release. | [] |
