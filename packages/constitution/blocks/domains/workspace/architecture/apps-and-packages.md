# Apps and packages

> Governs when shared code becomes a package and the direction of the imports between units.

## Packages

### package-cut-on-its-second-user → code-placed-by-its-reason-to-change · MUST

Code the units share becomes a unit of `packages/` when a second unit needs it, and returns to its user when only one still does; until then it lives in the source of its one user. A unit of `packages/` the repository releases is one from the start.

| Why | Tags |
|---|---|
| kept with its one user a piece changes with it, while one moved early guesses at a sharing that may never come. | [] |

## Direction

### apps-blind-to-each-other → feature-never-imports-a-feature · MUST

A unit of `apps/` never imports another.

| Why | Tags |
|---|---|
| a unit that knows another cannot be released, changed or removed alone; what two of them need goes to `packages/`. | [] |

### packages-never-import-apps → import-points-inward · MUST

A unit of `packages/` never imports a unit of `apps/`, while it may import another of `packages/`.

| Why | Tags |
|---|---|
| the more units need a piece, the more stable it must be, and an import of an app makes it change whenever that app does. | [] |
