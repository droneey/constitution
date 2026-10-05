# Package

## Layout

## package-root-holds-only-the-workspace · SHOULD
The root of a repository of packages holds only the workspace and the scripts of the check.

| Why | Check | Tags |
|---|---|---|
| a root with no code of its own has nothing a package could import by accident, and nothing that leaks into a consumer. | review | [] |

## package-anatomy → anatomy-top-level-by-concern
A package holds its manifest, its README, its licence, its source, and its specs where its language keeps them.

| Why | Check | Tags |
|---|---|---|
| every package looks the same inside, so a reader and a tool know where each part is. | review | [] |

## Entries and consumers

## package-knows-no-consumer → libs-import-no-application-code
A package ships configuration, primitives or tooling, never a product's business, and knows nothing of those who install it.

| Why | Check | Tags |
|---|---|---|
| a package that knows its consumer changes whenever the consumer does, and serves no one else. | tool/imports | [] |

## package-entries-curated → access-only-through-curated-surface
The manifest lists every entry a consumer may use and nothing else, and names the files it ships.

| Why | Check | Tags |
|---|---|---|
| every path a consumer can reach becomes part of the contract, and cannot change without breaking someone. | review | [] |

## consumers-import-package-entries → package-entries-curated
A consumer imports a package by an entry its manifest lists, never by a path inside the package.

| Why | Check | Tags |
|---|---|---|
| a path inside a package is not part of its contract, and the next release may move it. | tool/imports | [] |

## consumers-extend-never-copy · SHOULD
Consumers extend a package's entries; they never copy its files.

| Why | Check | Tags |
|---|---|---|
| an extended entry takes every fix with the next update, and a copy takes none. | review | [] |

## template-copied-once-owned-by-consumer · SHOULD
A file no tool can extend is a template: kept canonical in the repository that publishes it, copied once, then owned by the consumer. Copies stay alike by convention, with no checker; a template that needs a checker should have been an entry.

| Why | Check | Tags |
|---|---|---|
| a template is for files a tool cannot share, and pretending to keep copies in sync costs more than the drift. | review | [] |

## consumer-takes-package-by-preferred-mechanism · SHOULD
A consumer takes a package by the tool's own extends, else by a one-line module that re-exports it, else by the tool's remote configuration.

| Why | Check | Tags |
|---|---|---|
| the closer to the tool's own mechanism, the less glue each consumer writes and keeps. | review | [] |

## shared-package-file-lives-once → generated-copy-guarded-by-spec
A file several packages ship lives once, and each package holds only a copy generated from it.

| Why | Check | Tags |
|---|---|---|
| one source means a fix is made once and reaches every package, and no copy becomes a second original. | review | [] |
