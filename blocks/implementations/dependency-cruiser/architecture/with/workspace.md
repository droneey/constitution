# dependency-cruiser with workspace

> The configuration that holds the imports between the units of a workspace.

### imports-between-units-held-at-the-root → units-import-toward-libs
The root's configuration extends the part `workspace.mjs`, which holds the imports between the units of `packages/`, `shared/` and `libs/`.

| Why | Tags |
|---|---|
| an import between units crosses the folders of two of them, which no unit's own configuration reads. | [] |
