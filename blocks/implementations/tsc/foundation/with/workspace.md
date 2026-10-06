# tsc with workspace

> Each unit of a workspace as a project of its own.

## unit-built-as-a-composite-project → unit-compiled-by-its-own-options
Each unit's configuration is a `composite` project that emits only its declarations, with its `.tsbuildinfo`, into the unit's `.tsc-cache/`, a folder the repository ignores and every other tool leaves out; a unit that imports another lists the other in `references`, the root's `tsconfig.json` holds no file and references every unit, and the type check runs `tsc -b` from the root.

| Why | Check | Tags |
|---|---|---|
| `tsc -b` checks each unit with its own options, the imported ones first, and the importer reads their declarations instead of compiling their files; the declarations are a cache of the check, kept out of the tree the tools read. | review | [] |
