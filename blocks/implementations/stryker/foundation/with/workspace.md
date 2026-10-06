# Stryker with workspace

> The mutation configuration of each package of a workspace.

## stryker-configuration-per-unit → unit-checked-by-its-own-parts
In a workspace, each package with code its specs run has its own `stryker.config.mjs` in its folder.

| Why | Check | Tags |
|---|---|---|
| Stryker reads its `mutate` globs and the folder it copies into its sandbox from the folder it starts in, and a package's mutants are killed by the package's own specs. | review | [] |
