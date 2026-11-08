# Checks

> Governs the tools that check each package and the checks across packages.

## Vocabulary

The **checks across packages** are the checks that read several packages at once, such as those of the imports between them.

## General

### unit-checked-by-its-own-tools → configuration-holds-what-its-blocks-compute · MUST

Each package is checked by the tools of its own blocks, run with that package's configuration.

| Why |
|---|
| a tool's configuration applied from the root either misses a package's paths, as one that names `src/` does, and passes in silence, or applies one package's configuration to the others and changes their rules. |

### package-checks-reach-only-its-own-files · MUST

No package's checks reach another package's files. Exempt: the root's checks across packages.

| Why |
|---|
| a check that reaches into another package holds that package's files to settings written for its own tree, and fails or passes them by rules their own package never chose. |
