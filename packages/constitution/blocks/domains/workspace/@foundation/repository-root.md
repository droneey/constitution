# Repository root

> Governs what the repository's root holds and lists.

## Vocabulary

A **language workspace** is the set of a repository's packages of one language that one package manager installs and links together.

## General

### root-holds-only-the-workspace · SHOULD

The repository's root holds no code but the declarations of its language workspaces and the configuration of its tools.

| Why |
|---|
| a root with code of its own has something a package could import by accident, and something that leaks into a consumer. |

### root-holds-one-workspace-per-language · MUST

Each language's packages form one language workspace, declared at the repository's root. Its members are every package of that language in the repository, and no package declares a language workspace of its own.

| Why |
|---|
| a language workspace nested in a package is refused by one package manager and ignored by another, so its packages are never linked. |

### root-lists-only-what-its-own-files-need → configuration-holds-what-its-blocks-compute · MUST

The root's `constitution.yaml` lists only the blocks that the root's own files and the checks across packages need. It lists no block that only a package below it needs.

| Why |
|---|
| a root that listed its packages' blocks would hold each package's files to settings written for another's tree, as a path written from one package's `src/` misses or refuses the files of the rest. |
