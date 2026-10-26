# Workspace

> Governs the mutation configuration of each package of a workspace.

## General

### stryker-configuration-per-unit → unit-configuration-kept-in-its-folder · MUST

In a workspace, each package with code its specs run has its own `stryker.config.json` in its folder.

| Why |
|---|
| Stryker reads its `mutate` globs and the folder it copies into its sandbox from the folder it starts in, and a package's mutants are killed by the package's own specs. |
