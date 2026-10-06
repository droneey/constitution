# Stryker with workspace

> The mutation run of each unit of a workspace.

## mutation-checked-from-each-unit → unit-checked-by-its-own-parts
In a workspace, each unit with code its specs run has its own `stryker.config.mjs`, and the check runs `mutation-check` from the unit's folder, where it mutates only the changes under that folder.

| Why | Check | Tags |
|---|---|---|
| Stryker reads its configuration, its `mutate` globs and the folder it copies into its sandbox from where it runs, and a unit's mutants are killed by the unit's own specs. | review | [] |
