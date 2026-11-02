# Workspace

> Governs the mutation configuration of each package of a workspace.

## General

### stryker-configuration-per-unit → unit-configuration-kept-in-its-folder · MUST

In a workspace, each package with code its specs run has its own `stryker.config.json` in its folder.

| Why |
|---|
| Stryker reads its `mutate` globs and the folder it copies into its sandbox from the folder it starts in, so one configuration for the workspace reads every package by one package's paths, while a package's mutants are killed by the package's own specs. |
