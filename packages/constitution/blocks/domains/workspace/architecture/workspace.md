# Workspace

> Governs the tree of units and the direction of their imports.

## The tree

### workspace-units-placed-by-how-they-leave · SHOULD

A workspace holds its units in two places at its root: `apps/<name>/`, what the repository deploys and runs itself and nobody adds as a dependency — a site, a service, a mobile app; and `packages/<name>/`, every other unit — what its apps share, and the libraries, tools and configurations it releases.

| Why | Tags |
|---|---|
| the folder says how a unit leaves the repository, the split a reader of Turborepo or of a package manager's workspace knows on sight, and a library or a tool others install sits in `packages/` as in every repository of libraries and tools. | [] |

### business-shared-across-languages-lives-in-one-package · SHOULD

Business that programs in different languages run lives first in one package, written in a language every one of them can run and compiled for each, reached through generated bindings. Where no such language serves every target, it lives in the service they call. A client then keeps only what must work without the service, as a copy per language, held together by the schema and the conformance cases in the `shared/` folder of the unit that holds those copies.

| Why | Tags |
|---|---|
| business written once cannot drift between languages, as Rust compiled to native bindings and WebAssembly, or Kotlin Multiplatform, shows; a copy per language is the last resort, held together by the cases every copy must pass. | [] |

### unit-offers-everything-through-its-one-package · SHOULD

Whatever a unit offers — its core, its wire shapes, its integrations into host frameworks — is a module or an entry of its one package per language, an integration in `integrations/<host>/`, never a package of its own.

| Why | Tags |
|---|---|
| a consumer installs one package and imports the entries it needs, and the unit is versioned and released as one. | [] |

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
