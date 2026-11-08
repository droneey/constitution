# Workspace

> Governs the configuration of each package of a workspace.

## General

### knip-root-ignores-the-workspaces → unit-checked-by-its-own-tools · MUST

Every root that runs knip over its own files leaves each package to its own `knip.jsonc` through `ignoreWorkspaces`.

| Why |
|---|
| a run from the root reads every package by the root's configuration, which then names each package's insides and holds one package to settings written for another, and `ignoreWorkspaces` is a key only the root's configuration takes. |
