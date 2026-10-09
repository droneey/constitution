# Workspace

> Governs the tree of units and the direction of their imports.

## The tree

### workspace-units-placed-by-reach · SHOULD
A workspace holds its units in three places at its root, with the roles and the direction they have inside a program: `packages/<name>/`, the products, blind to each other; `shared/`, what two or more products need; and `libs/<name>/`, what knows nothing of the product.

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

### unit-offers-everything-through-its-one-package · SHOULD
Whatever a unit offers — its core, its wire shapes, its integrations into host frameworks — is a module or an entry of its one package per language, an integration in `integrations/<host>/`, never a package of its own.

| Why | Tags |
|---|---|
| a consumer installs one package and imports the entries it needs, and the unit is versioned and released as one. | [] |

### unit-named-after-its-folder · SHOULD
A unit is imported by its name, which follows its folder under the repository's scope: a product by its own name, in each of its languages; `shared/` as `shared`; a unit of `libs/` as `libs-<name>`. An integration is an entry of the unit's package.

| Why | Tags |
|---|---|
| an import then names the folder it reaches, so a reader sees which way it points. | [] |

## Shared

### shared-unit-laid-out-by-meaning · SHOULD
`shared/` is laid out by meaning, as a program's `shared/` is — `contracts/`, `kinds/`, the protocol two products speak.

| Why | Tags |
|---|---|
| every product looks for what it shares in one place, sorted by what it is. | [] |

### shared-part-appears-with-its-second-product → code-placed-by-its-reason-to-change · MUST
A part of `shared/` appears when a second product needs it; until then it lives with its one product.

| Why | Tags |
|---|---|
| kept with its one user a piece changes with it, while one moved early guesses at a sharing that may never come. | [] |

## Direction

### product-units-blind-to-each-other → feature-never-imports-a-feature · MUST
A unit of `packages/` never imports another.

| Why | Tags |
|---|---|
| a unit that knows another cannot be released, changed or removed alone. | [] |

### units-import-toward-libs → import-points-inward · MUST
Imports between units point from `packages/` to `shared/` to `libs/`: `shared/` imports no unit of `packages/`, and a unit of `libs/` none of `packages/` and nothing of `shared/`.

| Why | Tags |
|---|---|
| the more units need a piece, the more stable it must be, and an import upward makes it change whenever one of its users does. | [] |
