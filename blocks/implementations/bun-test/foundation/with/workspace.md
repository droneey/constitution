# Bun test with workspace

> The specs and the coverage gate of each unit of a workspace.

## coverage-gate-on-the-unit-alone → unit-checked-by-its-own-parts
In a workspace, each unit's `bunfig.toml` adds `"../**"` to `coveragePathIgnorePatterns`, so its gate counts only the unit's own files, never those of a unit it imports.

| Why | Check | Tags |
|---|---|---|
| Bun counts every file a spec loads, an imported unit's source included, so a unit whose specs use one function of another fails on the other's functions it never calls; the other unit's own specs hold its files. | review | [testing] |

## unit-without-specs-passes-empty → unit-checked-by-its-own-parts
A unit that holds no code a spec could run — only types, or only data — runs `bun test --pass-with-no-tests`, and no other unit passes the flag.

| Why | Check | Tags |
|---|---|---|
| `bun test` fails when it finds no spec, and the flag on a unit with code would let a unit whose specs are gone pass in silence. | review | [] |
