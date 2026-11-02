# Workspace

> Governs each package of a workspace as a project of its own.

## General

### unit-built-as-a-composite-project → unit-compiled-by-its-own-options · MUST

Each package is a `composite` project that emits only its declarations. It emits them, with its `.tsbuildinfo`, into the package's **`.tsc-cache/`**{#declaration-cache}, a folder the repository ignores and every other tool leaves out; a package that imports another lists the other in `references`.

| Why |
|---|
| a package that compiles another's files checks them by its own options instead of theirs, and declarations left in the tree are read by the other tools as source; `tsc -b` checks each referenced package first, by its own options, and the importer reads its declarations. |
