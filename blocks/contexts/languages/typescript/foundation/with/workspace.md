# TypeScript with workspace

> The manifests of a TypeScript workspace, and how its units are compiled.

## root-manifest-private → workspace-root-private
The root `package.json` of a workspace is `"private": true`.

| Why | Check | Tags |
|---|---|---|
| a package manager refuses to publish a manifest marked private, so the root can never be published by mistake. | review | [] |

## unit-compiled-by-its-own-options → unit-checked-by-its-own-parts
Each unit is compiled with its own compiler options alone: a unit that imports another is checked against the declarations of the other's entries, never against the other's source compiled with its own options.

| Why | Check | Tags |
|---|---|---|
| the compiler applies the options and the `paths` of the program it checks to every file it compiles, so the imported unit's `#/` would resolve into the importer's `src/`, and an option the importer turns off would fail in a file the importer does not own. | review | [] |

## own-units-are-no-tools → units-linked-from-the-working-tree
A unit of the repository in `devDependencies` is no tool: it is linked from the working tree, never pinned to a version.

| Why | Check | Tags |
|---|---|---|
| a unit changes with the repository it lives in, so the version it is required at names the working tree, not a release. | review | [] |
