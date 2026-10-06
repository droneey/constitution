# Stryker with workspace

> The mutation configuration of each unit of a workspace.

## stryker-configuration-per-unit → unit-checked-by-its-own-parts
In a workspace, each unit with code its specs run has its own `stryker.config.mjs` in its folder.

| Why | Check | Tags |
|---|---|---|
| Stryker reads its `mutate` globs and the folder it copies into its sandbox from the folder it starts in, and a unit's mutants are killed by the unit's own specs. | review | [] |
