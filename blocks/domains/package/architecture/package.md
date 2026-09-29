# Package

## Layout

## package-repository-layout → anatomy-top-level-by-concern
A repository of packages keeps each package at `packages/<language>/libs/<name>/`, language-free files and hooks in `packages/common/`, and templates per language and in `common`. A new language is a new folder.

| Why | Check | Tags |
|---|---|---|
| a reader finds every package of every repository in the same place, and a new language adds a folder without moving the others. | review | [] |

## package-root-private · SHOULD
The root of a repository of packages is private: it holds only the workspace, the scripts of the check, and a README with one row per package.

| Why | Check | Tags |
|---|---|---|
| a root that publishes nothing and holds no code of its own cannot leak into a consumer. | review | [] |

## package-anatomy → anatomy-top-level-by-concern
A package holds its manifest, its README, its licence, its `configs/` or `src/`, and its `__tests__/`.

| Why | Check | Tags |
|---|---|---|
| every package looks the same inside, so a reader and a tool know where each part is. | review | [] |

## package-dependency-matrix → dependencies-point-inward-without-cycles
`common` imports nothing. A language package reaches only its peers, its declared dependencies and `common` at build time; no package imports another package's files.

| Why | Check | Tags |
|---|---|---|
| packages that reach into each other cannot be released, versioned or replaced apart. | tool/architecture | [] |

## Entries and consumers

## package-knows-no-consumer → libs-import-no-application-code
A package ships configuration, primitives or tooling, never a product's business, and knows nothing of those who install it.

| Why | Check | Tags |
|---|---|---|
| a package that knows its consumer changes whenever the consumer does, and serves no one else. | tool/architecture | [] |

## package-entries-curated → access-only-through-curated-surface
The manifest lists every entry a consumer may use and nothing else, and names the files it ships. A consumer imports an entry, never a path inside the package.

| Why | Check | Tags |
|---|---|---|
| every path a consumer can reach becomes part of the contract, and cannot change without breaking someone. | review | [] |

## consumers-extend-never-copy · SHOULD
Consumers extend a package's entries; they never copy its files.

| Why | Check | Tags |
|---|---|---|
| an extended entry takes every fix with the next update, and a copy takes none. | review | [] |

## template-copied-once-owned-by-consumer · SHOULD
A file no tool can extend is a template: kept canonical under `templates/`, copied once, then owned by the consumer. Copies stay alike by convention, with no checker; a template that needs a checker should have been an entry.

| Why | Check | Tags |
|---|---|---|
| a template is for files a tool cannot share, and pretending to keep copies in sync costs more than the drift. | review | [] |

## consumer-takes-package-by-preferred-mechanism · SHOULD
A consumer takes a package by the tool's own extends, else by a one-line module that re-exports it, else by the tool's remote configuration.

| Why | Check | Tags |
|---|---|---|
| the closer to the tool's own mechanism, the less glue each consumer writes and keeps. | review | [] |

## language-free-file-lives-once-in-common → generated-copy-guarded-by-spec
A language-free file lives once, in `common`; a language package that ships it holds only a copy generated from it.

| Why | Check | Tags |
|---|---|---|
| one source means a fix is made once and reaches every language, and no copy becomes a second original. | review | [] |
