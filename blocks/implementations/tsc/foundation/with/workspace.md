# tsc with workspace

> Each package of a workspace as a project of its own.

## unit-built-as-a-composite-project → unit-compiled-by-its-own-options
Each package's configuration is a `composite` project that emits only its declarations, with its `.tsbuildinfo`, into the package's `.tsc-cache/`, a folder the repository ignores and every other tool leaves out; a package that imports another lists the other in `references`, and the root's `tsconfig.json` holds no file and references every package.

| Why | Check | Tags |
|---|---|---|
| a build of the root checks each package with its own options, the imported ones first, and the importer reads their declarations instead of compiling their files; the declarations are a cache of the check, kept out of the tree the tools read. | review | [] |
