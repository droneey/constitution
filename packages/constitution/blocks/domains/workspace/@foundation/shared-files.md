# Shared files

> Governs a file, data or code that several packages need, and the types generated from shared data.

## General

### file-lives-once-across-units → fact-has-one-source · MUST

Every file several packages need lives once, in one package, from which every other package takes it. No copy of it is kept in another package.

| Why |
|---|
| a copy becomes a second original that drifts from the one reviewed, and a fix made to one never reaches the other — a single source of truth. |

### package-cut-where-its-purpose-has-a-second-user → structure-appears-only-on-a-present-need · SHOULD

All code goes to a package of `packages/` only where its purpose has more than one user: two or more packages of the repository, in one language or in several, or a user outside the repository, as a package the repository releases to others has. Code whose purpose has one user lives in that user's source, whatever other languages the repository holds. A purpose's users are counted across its languages, so each package of a cross-language purpose that `code-in-several-languages-holds-a-unit-per-language` gives a language stands though one user alone takes it. A user is a package that imports, runs or checks the code, or a project outside the repository that adds it as a dependency.

| Why |
|---|
| kept with its one user a piece changes with it, while one cut out before its purpose has a second user guesses at a sharing that may never come, and every change to it then crosses a boundary for nothing — you aren't gonna need it. |

## Generated types

### types-generated-in-their-languages-unit → generated-file-made-by-its-own-step · SHOULD

Every type generated from shared data is made by a step of the package of its language. No step of the package that holds the data makes it.

| Why |
|---|
| a step in the package of the shared data runs every language's generator from a package that builds none of them, so it changes whenever any language's tools do, and its output lands where no package of that language builds or checks it. |
