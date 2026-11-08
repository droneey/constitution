# Workspace

> Governs each package of a workspace as a project of its own.

## Vocabulary

A package's compiler emits its declarations and its build information into the folder **`tsc-cache.gen/`**{#declaration-cache}, which carries the generated folder's mark.

## General

### unit-built-as-a-composite-project → unit-compiled-by-its-own-options · MUST

Each package is a `composite` project that emits only its declarations. It emits them, with its `.tsbuildinfo`, into the package's `tsc-cache.gen/`.

| Why |
|---|
| a package that compiles another's files checks them by its own options instead of theirs; `tsc -b` checks each referenced package first, by its own options, and the importer reads its declarations from that folder. |

### importer-references-what-it-imports → unit-compiled-by-its-own-options · MUST

Every package that imports another lists the other in `references`.

| Why |
|---|
| without the reference the importer compiles the other's source by its own options, or fails with TS6307 on a file outside its project. |

### declaration-cache-left-out-by-every-other-tool · MUST

Every tool but the compiler leaves `tsc-cache.gen/` out.

| Why |
|---|
| declarations left in the tree are read by the other tools as source, and their findings on them point at code nobody wrote. |
