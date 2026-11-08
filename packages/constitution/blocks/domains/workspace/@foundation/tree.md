# Tree

> Governs where the packages of the repository sit, how a cross-language purpose is laid out, and what a package offers as its parts.

## Vocabulary

**`apps/`**{#deployed-unit} and **`packages/`**{#dependency-unit} are the two folders at the repository's root that hold its packages, `apps/` the ones it ships or runs for its users and `packages/` the rest, as `package-placed-by-whether-it-is-deployed` divides them.

A **cross-language purpose** is one job code does in several languages, such as validating one format or calling one service, never a whole product.

A **group folder** gathers the packages of one product or one cross-language purpose, as `apps/<group>/<name>/` or `packages/<group>/<name>/`; a group whose packages sit in both `apps/` and `packages/` has a group folder of its name in each.

A group's **shared package**, **`<group>/shared/`**{#shared-data-unit} in its group folder under `packages/`, is the package of the data the group's languages share, such as schemas and conformance cases, which nobody deploys.

## Placement

### package-placed-by-whether-it-is-deployed · MUST

Every package the repository ships or runs for its users, and nobody adds as a dependency, sits in `apps/`. Every other sits in `packages/`. Each package of a group folder is placed by its own deployment. A package of `apps/` is one such as a site, a service, a mobile or desktop app or a binary its users download; a package of `packages/` is what the apps share, or a library, a tool or a configuration others add as a dependency.

| Why |
|---|
| packages mixed in one folder hide which the repository deploys and which others install, so a reader treats a library as an app, or a deployed package as one others may depend on. |

### group-folder-holds-only-packages · MUST

Every group folder holds only packages and is no package itself.

| Why |
|---|
| a group folder that holds a manifest or files of its own is a package nobody declared, which every package inside it may import by accident and no tool checks as one. |

## Languages

### code-in-several-languages-holds-a-unit-per-language · MUST

Every cross-language purpose has a package per language, `<group>/<language>/`, in its group folder. Each of them sits in the group folder under `apps/` or under `packages/`, as its own deployment places it.

| Why |
|---|
| a package that holds a second language's code cannot ship as one language's package, as a published package carries no file outside its folder, and packages of one purpose scattered through the tree hide that they serve it. |

### shared-package-holds-only-data · MUST

Every group's shared package holds only data the group's languages share, never code.

| Why |
|---|
| code in the shared package belongs to no language's package, so no language builds or checks it, and data no language owns, copied into each instead, drifts apart. |

### business-shared-across-languages-lives-in-one-unit → fact-has-one-source · MUST

Every rule of the business that programs in several languages need has its one home in one package: the service they call or, for a rule declared as data, the group's shared package, from which each language's check is generated, the service's among them where there is one. Exempt: a rule that two programs owning their data apart both need, which stays in the one of them whose data it decides, and the other asks it.

| Why |
|---|
| business written in each language drifts between them, and the drift is found only when two programs disagree in front of a user, while a check generated from one declaration derives from it and cannot drift — a single source of truth. |

## Parts

### package-offers-its-parts-as-its-own-entries · MUST

Every package offers each of its parts as a module or a published entry of its own, never as a package apart. Such parts include its main logic and its wire shapes. Exempt: a part in another language, which is a package of its group, and the wire shapes packages of `apps/` exchange, which live in a package of `packages/` or are generated from the group's shared package.

| Why |
|---|
| a package split into several makes a consumer install and match the versions of several, and releases one package as many that drift apart, while the shapes two apps exchange can live in neither app, since no app imports another. |
