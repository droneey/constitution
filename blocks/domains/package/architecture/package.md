# Package

## Layout

## package-repository-layout · SHOULD
A repository of packages keeps each package at `packages/<language>/libs/<name>/`, language-free files and hooks in `packages/common/`, and templates per language and in `common`. A new language is a new folder.
**Why:** a reader finds every package of every repository in the same place, and a new language adds a folder without moving the others.
**Check:** tool — names
**Tags:** naming
**Implements:** `anatomy-top-level-by-concern`

## package-root-private · SHOULD
The root of a repository of packages is private: it holds only the workspace, the scripts of the check, and a README with one row per package.
**Why:** a root that publishes nothing and holds no code of its own cannot leak into a consumer.
**Check:** review

## package-anatomy · SHOULD
A package holds its manifest, its README, its licence, its `configs/` or `src/`, and its `__tests__/`.
**Why:** every package looks the same inside, so a reader and a tool know where each part is.
**Check:** tool — names
**Implements:** `anatomy-top-level-by-concern`

## package-dependency-matrix · MUST
`common` imports nothing. A language package reaches only its peers, its declared dependencies and `common` at build time; no package imports another package's files.
**Why:** packages that reach into each other cannot be released, versioned or replaced apart.
**Check:** tool — architecture
**Implements:** `dependencies-point-inward-without-cycles`

## Entries and consumers

## package-knows-no-consumer · MUST
A package ships configuration, primitives or tooling, never a product's business, and knows nothing of those who install it.
**Why:** a package that knows its consumer changes whenever the consumer does, and serves no one else.
**Check:** tool — architecture
**Implements:** `libs-import-no-application-code`

## package-entries-curated · MUST
The manifest lists every entry a consumer may use and nothing else, and names the files it ships. A consumer imports an entry, never a path inside the package.
**Why:** every path a consumer can reach becomes part of the contract, and cannot change without breaking someone.
**Check:** review
**Implements:** `access-only-through-curated-surface`

## consumers-extend-never-copy · SHOULD
Consumers extend a package's entries; they never copy its files.
**Why:** an extended entry takes every fix with the next update, and a copy takes none.
**Check:** review

## template-copied-once-owned-by-consumer · SHOULD
A file no tool can extend is a template: kept canonical under `templates/`, copied once, then owned by the consumer. Copies stay alike by convention, with no checker; a template that needs a checker should have been an entry.
**Why:** a template is for files a tool cannot share, and pretending to keep copies in sync costs more than the drift.
**Check:** review

## consumer-takes-package-by-preferred-mechanism · SHOULD
A consumer takes a package by the tool's own extends, else by a one-line module that re-exports it, else by the tool's remote configuration.
**Why:** the closer to the tool's own mechanism, the less glue each consumer writes and keeps.
**Check:** review

## language-free-file-lives-once-in-common · MUST
A language-free file lives once, in `common`; a language package that ships it holds only a copy generated from it.
**Why:** one source means a fix is made once and reaches every language, and no copy becomes a second original.
**Check:** review
**Implements:** `generated-copy-guarded-by-spec`
