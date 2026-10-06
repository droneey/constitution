# Bun test with workspace

> The coverage gate of each unit of a workspace.

## coverage-gate-on-the-unit-alone → unit-checked-by-its-own-parts
In a workspace, each unit's `bunfig.toml` adds `"../**"` to `coveragePathIgnorePatterns`, so its gate counts only the unit's own files, never those of a unit it imports.

| Why | Check | Tags |
|---|---|---|
| Bun counts every file a spec loads, an imported unit's source included, so a unit whose specs use one function of another fails on the other's functions it never calls; the other unit's own specs hold its files. | review | [testing] |
