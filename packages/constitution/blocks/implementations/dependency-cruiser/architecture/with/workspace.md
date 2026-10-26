# Workspace

> Governs the configuration that holds the imports between the units of a workspace.

## General

### imports-between-units-held-at-the-root → packages-never-import-apps · MUST

The root's configuration holds the settings of this seam, which hold the imports between the units of `apps/` and `packages/`.

| Why |
|---|
| an import between units crosses the folders of two of them, which no unit's own configuration reads. |
