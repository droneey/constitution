# Tree

> Governs the tree of units.

## General

### workspace-units-held-in-apps-and-packages · MUST

A workspace holds its units in two places at its root, **`apps/`**{#deployed-unit} and **`packages/`**{#dependency-unit}. `apps/<name>/` holds what the repository deploys and runs itself and nobody adds as a dependency — a site, a service, a mobile app; `packages/<name>/` holds every other unit — what its apps share, and the libraries, tools and configurations it releases. The units of one product may gather in a group folder of either, `apps/<group>/<name>/` or `packages/<group>/<name>/`, which holds units alone and is no unit itself.

| Why |
|---|
| units mixed in one folder hide which the repository deploys and which others install, so a reader treats a library as an app, or a deployed unit as one others may depend on. |

### code-in-several-languages-holds-a-package-per-language · MUST

Code that serves one purpose in several languages is a group folder with a package per language. Each language's package is `<group>/<language>/`, with the tree in its `src/`, and `<group>/shared/` is a package of the data the languages share — schemas, conformance cases, never code — laid out by meaning, `schema/`, `conformance/`, inside the one folder a reading language's packaging requires where one does. The group appears with the second language and `shared/` with the first thing they share; until then the code is the package itself.

| Why |
|---|
| a package that holds a second language's code or the data the languages share cannot ship as one language's package, as a published package can carry no file outside its folder; packages of one purpose scattered through the tree hide that they serve it, and data no language owns, copied into each, drifts apart. |

### business-shared-across-languages-lives-in-one-package · SHOULD

Business that programs in several languages need is written once. It lives in one package, the service they call, and a client copies per language only what must work without the service, held together by the schema and the conformance cases of its group's `shared/` package. It is left, with its reason recorded in `DECISIONS.md`, only where the business is too small for a service to repay its build; each language then keeps its copy, held together the same way.

| Why |
|---|
| business written in each language drifts between them, and a copy stays honest only by cases every copy must pass — a single source of truth. |

### unit-offers-everything-through-its-one-package · MUST

A unit offers everything through its one package. Whatever it offers — its core, its wire shapes, its integrations into host frameworks — is a module or an entry of that package, never a package of its own.

| Why |
|---|
| a unit split into packages makes a consumer install and match the versions of several, and releases one unit as many that drift apart. |
