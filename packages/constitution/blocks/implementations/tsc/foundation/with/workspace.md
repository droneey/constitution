# Workspace

> Governs each package of a workspace as a project of its own.

## General

### unit-built-as-a-composite-project → unit-compiled-by-its-own-options · MUST

Each package's configuration is a `composite` project that emits only its declarations, with its `.tsbuildinfo`, into the package's **`.tsc-cache/`**{#declaration-cache}, a folder the repository ignores and every other tool leaves out; a package that imports another lists the other in `references`.

| Why |
|---|
| `tsc -b` in a package checks the packages it imports first, each with its own options, and the importer reads their declarations instead of compiling their files; the declarations are a cache of the check, kept out of the tree the tools read. |
