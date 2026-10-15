# Workspace

> Governs the tree of units and the direction of their imports.

## The tree

### workspace-units-placed-by-reach · SHOULD
A workspace holds its units in three places at its root, with the roles and the direction they have inside a program: `apps/<name>/`, the programs, each with its root and blind to the others; `shared/<name>/`, each part two or more programs need, a unit of its own; and `libs/<name>/`, what knows nothing of the product.

| Why | Tags |
|---|---|
| a unit's folder says who may use it before it is opened, and the direction of the imports follows from the folders as it does between `features/`, `shared/` and `libs/`. | [] |

### unit-in-one-language-is-its-package · SHOULD
A unit in one language is one package: its manifest and its `src/` sit in the unit's folder.

| Why | Tags |
|---|---|
| a reader finds the package where the unit is, with no folder per language to cross. | [] |

### unit-in-several-languages-holds-a-package-per-language · SHOULD
A unit in several languages holds `shared/`, its data in no language laid out by meaning — `schema/`, `conformance/` — and one folder per language, `<language>/`, each one package with the tree in its `src/`; the language folders appear with the second language.

| Why | Tags |
|---|---|
| the unit is found in one folder whatever its languages, and its data in no language is written once beside the packages that read it. | [] |

### program-with-its-own-root-is-an-app → package-has-at-most-one-root · MUST
A program with a root of its own is a unit of `apps/`, and every unit of `apps/` is a program with its root.

| Why | Tags |
|---|---|
| each program then wires one tree of its own, released and changed apart from the others. | [] |

### business-shared-across-languages-lives-in-one-package · SHOULD
Business that programs in different languages run lives first in one package, written in a language every one of them can run and compiled for each, reached through generated bindings — Rust through native bindings and WebAssembly, Kotlin Multiplatform; where no such language serves every target, it lives in the service they call, and a client keeps only what must work without it, shared through the schema and the conformance cases of the shared unit's language-free `shared/` folder.

| Why | Tags |
|---|---|
| business written once cannot drift between languages, and a copy per language is the last resort, held together by the cases every copy must pass. | [] |

### unit-offers-everything-through-its-one-package · SHOULD
Whatever a unit offers — its core, its wire shapes, its integrations into host frameworks — is a module or an entry of its one package per language, an integration in `integrations/<host>/`, never a package of its own.

| Why | Tags |
|---|---|
| a consumer installs one package and imports the entries it needs, and the unit is versioned and released as one. | [] |

### unit-named-after-its-folder · SHOULD
A unit is imported by its name, which follows its folder under the repository's scope: a program by its own name, in each of its languages; a part of `shared/` as `shared-<name>`; a unit of `libs/` as `libs-<name>`.

| Why | Tags |
|---|---|
| an import then names the folder it reaches, so a reader sees which way it points. | [] |

## Shared

### shared-part-appears-with-its-second-app → code-placed-by-its-reason-to-change · MUST
A part of `shared/` appears when a second program needs it, and returns to its program when only one still does; until then it lives with its one program.

| Why | Tags |
|---|---|
| kept with its one user a piece changes with it, while one moved early guesses at a sharing that may never come. | [] |

## Direction

### app-units-blind-to-each-other → feature-never-imports-a-feature · MUST
A unit of `apps/` never imports another.

| Why | Tags |
|---|---|
| a unit that knows another cannot be released, changed or removed alone. | [] |

### units-import-toward-libs → import-points-inward · MUST
Imports between units point from `apps/` to `shared/` to `libs/`: a unit of `shared/` imports no unit of `apps/`, and a unit of `libs/` none of `apps/` and nothing of `shared/`.

| Why | Tags |
|---|---|
| the more units need a piece, the more stable it must be, and an import upward makes it change whenever one of its users does. | [] |
