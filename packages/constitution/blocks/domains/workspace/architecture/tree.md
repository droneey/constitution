# Tree

> Governs the tree of units.

## General

### workspace-units-placed-by-how-they-leave · SHOULD

A workspace holds its units in two places at its root, **`apps/`** and **`packages/`**: `apps/<name>/`, what the repository deploys and runs itself and nobody adds as a dependency — a site, a service, a mobile app; and `packages/<name>/`, every other unit — what its apps share, and the libraries, tools and configurations it releases.

| Why |
|---|
| the folder says how a unit leaves the repository, the split a reader of Turborepo or of a package manager's workspace knows on sight, and a library or a tool others install sits in `packages/` as in every repository of libraries and tools. |

### business-shared-across-languages-lives-in-one-package · SHOULD

Business that programs in different languages run lives first in one package, written in a language every one of them can run and compiled for each, reached through generated bindings. Where no such language serves every target, it lives in the service they call. A client then keeps only what must work without the service, as a copy per language, held together by the schema and the conformance cases in the `shared/` folder of the unit that holds those copies.

| Why |
|---|
| business written once cannot drift between languages, as Rust compiled to native bindings and WebAssembly, or Kotlin Multiplatform, shows; a copy per language is the last resort, held together by the cases every copy must pass. |

### unit-offers-everything-through-its-one-package · SHOULD

Whatever a unit offers — its core, its wire shapes, its integrations into host frameworks — is a module or an entry of its one package per language, an integration in `integrations/<host>/`, never a package of its own.

| Why |
|---|
| a consumer installs one package and imports the entries it needs, and the unit is versioned and released as one. |
