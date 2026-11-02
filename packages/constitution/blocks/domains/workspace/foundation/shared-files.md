# Shared files

> Governs a file or data that several units need, and the types generated from shared data.

## General

### file-lives-once-across-units → fact-has-one-source · MUST

A file several packages need lives once, in a package of its own. A package that needs it at run time takes it by that package's name, bundled by its build or installed beside it as a dependency, and no copy of it is committed.

| Why |
|---|
| a committed copy becomes a second original that drifts from the one reviewed, and a fix made to one never reaches the other — a single source of truth. |

## Generated types

### types-generated-in-their-languages-unit → generated-file-made-by-its-own-step · SHOULD

Types generated from shared data are generated in the unit of their language. They are made there by a step of its own, never in the package that holds the data.

| Why |
|---|
| types generated in the package of the shared data put code of every language in a package that holds none, where no unit of that language builds or checks it. |
