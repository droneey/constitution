# Apps and packages

> Governs when shared code becomes a package and the direction of the imports between units.

## Packages

### package-cut-on-its-second-user → code-placed-by-its-reason-to-change · MUST

Shared code becomes a unit of `packages/` when a second unit needs it. It returns to its user when only one still does, and until then it lives in the source of its one user; a unit of `packages/` the repository releases is one from the start.

| Why |
|---|
| kept with its one user a piece changes with it, while one moved early guesses at a sharing that may never come, and every change to it then crosses a boundary for nothing — you aren't gonna need it. |

## Direction

### apps-blind-to-each-other · MUST

A unit of `apps/` never imports another.

| Why |
|---|
| a unit that knows another cannot be released, changed or removed alone; what two of them need goes to `packages/`. |

### packages-never-import-apps → dependency-points-toward-stability · MUST

A unit of `packages/` never imports a unit of `apps/`, while it may import another of `packages/`.

| Why |
|---|
| the more units need a piece, the more stable it must be, and an import of an app makes it change whenever that app does — the stable dependencies principle. |
