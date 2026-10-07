# Workspace

## The tree

```
packages/<name>/          a product, blind to the others
shared/                   what two or more products need
libs/<name>/              what knows nothing of the product

packages/<name>/          a unit in one language: the package itself
├── <manifest>
└── src/

packages/<name>/          a unit in several languages
├── shared/               its data in no language, laid out by meaning: schema/, conformance/
└── <language>/           one package for each language, each with its manifest and the tree in src/
```

### workspace-units-placed-by-reach · SHOULD
A workspace holds its units in three places at its root, with the roles and the direction they have inside a program: `packages/<name>/`, the products, blind to each other; `shared/`, what two or more products need; and `libs/<name>/`, what knows nothing of the product.

| Why | Tags |
|---|---|
| a unit's folder says who may use it before it is opened, and the direction of the imports follows from the folders as it does between `features/`, `shared/` and `libs/`. | [] |

### unit-is-one-package-per-language · SHOULD
A unit in one language is the package itself, its manifest and `src/` in the unit's folder. A unit in several languages holds `shared/`, its data in no language laid out by meaning — `schema/`, `conformance/` — and a folder for each language, `<language>/`, each one package with the tree in its `src/`; the language's folder appears with the second language. Whatever a unit offers — its core, its wire shapes, its integrations into host frameworks — is a module of that package, an integration in `integrations/<framework>/`, never a package of its own.

| Why | Tags |
|---|---|
| a unit is then found in one folder whatever its languages, its data in no language is written once beside the packages that read it, and a consumer installs one package and imports the entries it needs. | [] |

### unit-named-after-its-folder · SHOULD
A unit is imported by its name, which follows its folder under the repository's scope: a product by its own name, in each of its languages; `shared/` as `shared`; a unit of `libs/` as `libs-<name>`. An integration is an entry of the unit's package.

| Why | Tags |
|---|---|
| an import then names the folder it reaches, so a reader sees which way it points; the direction itself is held by the folders an import resolves to, so a wrong name never hides a wrong direction. | [] |

### root-holds-only-the-workspace · SHOULD
The root of a workspace holds only the workspace and the configuration of its tools.

| Why | Tags |
|---|---|
| a root with no code of its own has nothing a unit could import by accident, and nothing that leaks into a consumer. | [] |

### shared-part-on-the-second-consumer → code-placed-by-its-reason-to-change · MUST
What two or more products need lives in `shared/`, laid out by meaning as a program's `shared/` is — `contracts/`, `kinds/`, the protocol two of them speak — and a part of it appears when a second product needs it.

| Why | Tags |
|---|---|
| kept with its one user, a piece changes with it; moved when a second one needs it, it is written once, in the one place every product looks for what it shares. | [] |

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
| the more units need a piece, the more stable it must be; an import upward makes it change whenever one of its users does. | [] |

### no-unit-reached-by-path · MUST
No file of a unit of `packages/`, of `shared/`, of a unit of `libs/` or of the root reaches into the folder of another unit by a path.

| Why | Tags |
|---|---|
| the tree tells one unit's folder from another's, so an import whose path crosses into another unit is the one a tool can refuse. | [] |
