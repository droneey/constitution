# Workspace

> Governs the tree of units and the direction of their imports.

## The tree

### workspace-units-placed-by-reach · SHOULD

A workspace holds its units in three places at its root, with the roles and the direction they have inside a program: `products/<name>/`, what the repository releases — a program or a package others install; `shared/<name>/`, each part two or more products need, a unit of its own; and `libs/<name>/`, what knows nothing of the product. A unit is placed by its role in this repository: a library is a unit of `products/` where the repository releases it, and of `libs/` where it is built only for the repository's product.

| Why | Tags |
|---|---|
| a unit's folder says who may use it before it is opened, and the direction of the imports follows from the folders as it does between `features/`, `shared/` and `libs/`; a program and a package others install are both what the repository releases, and neither is imported by another product. | [] |

### program-with-its-own-root-is-a-product → package-has-at-most-one-root · MUST

A program with a root of its own is a unit of `products/`, never of `shared/` or `libs/`.

| Why | Tags |
|---|---|
| each program then wires one tree of its own, released and changed apart from the others, and what the products share holds no wiring of its own. | [] |

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

### unit-named-after-its-folder · SHOULD

A unit is imported by its name, which follows its folder under the repository's scope: a product by its own name, in each of its languages; a part of `shared/` as `shared-<name>`; a unit of `libs/` as `libs-<name>`.

| Why | Tags |
|---|---|
| an import then names the folder it reaches, so a reader sees which way it points. | [] |

## Shared

### shared-part-appears-with-its-second-product → code-placed-by-its-reason-to-change · MUST

A part of `shared/` appears when a second product needs it, and returns to its product when only one still does; until then it lives with its one product.

| Why | Tags |
|---|---|
| kept with its one user a piece changes with it, while one moved early guesses at a sharing that may never come. | [] |

## Direction

### products-blind-to-each-other → feature-never-imports-a-feature · MUST

A unit of `products/` never imports another.

| Why | Tags |
|---|---|
| a unit that knows another cannot be released, changed or removed alone; what two of them need goes to `shared/`, or to `libs/` when it knows nothing of the product. | [] |

### units-import-toward-libs → import-points-inward · MUST

Imports between units point from `products/` to `shared/` to `libs/`: a unit of `shared/` imports no unit of `products/`, and a unit of `libs/` none of `products/` and nothing of `shared/`.

| Why | Tags |
|---|---|
| the more units need a piece, the more stable it must be, and an import upward makes it change whenever one of its users does. | [] |
