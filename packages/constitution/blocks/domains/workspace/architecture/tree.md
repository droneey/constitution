# Tree

> Governs the tree of units.

## General

### workspace-units-placed-by-how-they-leave · SHOULD

A workspace holds its units in two places at its root, **`apps/`**{#deployed-unit} and **`packages/`**{#dependency-unit}: `apps/<name>/`, what the repository deploys and runs itself and nobody adds as a dependency — a site, a service, a mobile app; and `packages/<name>/`, every other unit — what its apps share, and the libraries, tools and configurations it releases. The units of one product may gather in a group folder of either, `apps/<group>/<name>/` or `packages/<group>/<name>/`, which holds units alone and is no unit itself.

| Why |
|---|
| the folder says how a unit leaves the repository — deployed by it, or installed by others — so a reader knows each unit's kind on sight. |

### code-in-several-languages-holds-a-package-per-language · SHOULD

Code that serves one purpose in several languages is a group folder of units: `<group>/<language>/`, one package for each language with the tree in its `src/`, and `<group>/shared/`, a package of the data the languages share — schemas, conformance cases, never code — laid out by meaning, `schema/`, `conformance/`, inside the one folder a reading language's packaging requires where one does. The group appears with the second language and `shared/` with the first thing they share; until then the code is the package itself.

| Why |
|---|
| each package then ships alone with all it holds, as a published package can carry no file outside its folder; the group shows in the tree the packages that serve one purpose, and the data no language owns is written once. |

### business-shared-across-languages-lives-in-one-package · SHOULD

Business that programs in several languages need is written once — in one package, in a language every target runs, reached through generated bindings, or, where none runs on every target, in the service they call; a client copies per language only what must work without the service, held together by the schema and the conformance cases of its group's `shared/` package.

| Why |
|---|
| business written in each language drifts between them, and a copy stays honest only by cases every copy must pass. |

### unit-offers-everything-through-its-one-package · SHOULD

Whatever a unit offers — its core, its wire shapes, its integrations into host frameworks — is a module or an entry of its one package, an integration in `integrations/<host>/`, never a package of its own.

| Why |
|---|
| a consumer installs one package and imports the entries it needs, and the unit is versioned and released as one. |
