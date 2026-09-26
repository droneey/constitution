---
id: package
kind: domain
summary: "Publishing packages: layout, public entries, versions and releases."
chapters: []
requires: []
extends: null
abstract: false
checks: []
owns: []
governs: ["packages/**"]
status: stable
---

# Package

> A repository that publishes packages for others to install: configuration, primitives or tooling. The rules about several packages say "a repository of packages"; a repository that publishes one tool follows the rest.

## Layout

## package-repository-layout · SHOULD
A repository of packages keeps each package at `packages/<language>/libs/<name>/`, language-free files and hooks in `packages/common/`, and templates per language and in `common`. A new language is a new folder.
**Why:** a reader finds every package of every repository in the same place, and a new language adds a folder without moving the others.
**Check:** tool — names
**Tags:** architecture, naming
**Implements:** `anatomy-top-level-by-concern`

## package-root-private-and-shared · SHOULD
The root of a repository of packages is private: it holds only the workspace, the scripts of the check, and a README with one row per package.
**Why:** a root that publishes nothing and holds no code of its own cannot leak into a consumer.
**Check:** review
**Tags:** architecture

## package-anatomy · SHOULD
A package holds its manifest, its README, its licence, its `configs/` or `src/`, and its `__tests__/`.
**Why:** every package looks the same inside, so a reader and a tool know where each part is.
**Check:** tool — names
**Tags:** architecture
**Implements:** `anatomy-top-level-by-concern`

## package-named-scope-kit-language-name · SHOULD
A package is named `<scope>/<kit>-<language>-<name>`, after what it configures.
**Why:** the name tells a consumer which kit, which language and which tool the package serves before it is installed.
**Check:** review
**Tags:** naming

## package-dependency-matrix · MUST
`common` imports nothing. A language package reaches only its peers, its declared dependencies and `common` at build time; no package imports another package's files.
**Why:** packages that reach into each other cannot be released, versioned or replaced apart.
**Check:** tool — architecture
**Tags:** architecture
**Implements:** `dependencies-point-inward-without-cycles`

## Entries and consumers

## package-knows-no-consumer · MUST
A package ships configuration, primitives or tooling, never a product's business, and knows nothing of those who install it.
**Why:** a package that knows its consumer changes whenever the consumer does, and serves no one else.
**Check:** tool — architecture
**Tags:** architecture
**Implements:** `libs-import-no-application-code`

## package-entries-curated · MUST
The manifest lists every entry a consumer may use and nothing else, and names the files it ships. A consumer imports an entry, never a path inside the package.
**Why:** every path a consumer can reach becomes part of the contract, and cannot change without breaking someone.
**Check:** review
**Tags:** architecture
**Implements:** `access-only-through-curated-surface`

## configured-tool-is-a-peer-with-floor · MUST
The tool a package configures is a peer dependency with a lowest supported version, never a dependency of the package. A package takes a runtime dependency only when it runs code.
**Why:** the consumer owns the tool's version; a package that installs its own copy splits the consumer's tooling in two.
**Check:** review
**Tags:** architecture

## consumers-extend-never-copy · SHOULD
Consumers extend a package's entries; they never copy its files.
**Why:** an extended entry takes every fix with the next update, and a copy takes none.
**Check:** review
**Tags:** architecture

## template-copied-once-owned-by-consumer · SHOULD
A file no tool can extend is a template: kept canonical under `templates/`, copied once, then owned by the consumer. Copies stay alike by convention, with no checker; a template that needs a checker should have been an entry.
**Why:** a template is for files a tool cannot share, and pretending to keep copies in sync costs more than the drift.
**Check:** review
**Tags:** architecture

## consumer-takes-package-by-preferred-mechanism · SHOULD
A consumer takes a package by the tool's own extends, else by a one-line module that re-exports it, else by the tool's remote configuration; it pins the package through its lockfile and updates it through the bot.
**Why:** the closer to the tool's own mechanism, the less glue each consumer writes and keeps.
**Check:** review
**Tags:** architecture
**Implements:** `shared-tooling-from-pinned-packages`

## root-dogfoods-every-package · SHOULD
The root of a repository of packages installs its own packages and extends them as a consumer would.
**Why:** a package the repository does not use itself is broken first in a consumer's repository.
**Check:** review
**Tags:** architecture

## generated-copy-guarded-by-spec · MUST
A copy generated from `common` is rebuilt by the package's build, never edited by hand, and a spec asserts it equals its source.
**Why:** a copy that drifts from its source ships a different file than the one reviewed.
**Check:** test
**Tags:** testing, architecture
**Implements:** `generated-files-marked-never-edited`

## package-spec-asserts-configuration-intent · SHOULD
Each shipped configuration has a spec that parses it and asserts its intent; code a package runs is held by the coverage gate like any other.
**Why:** a configuration package has no behaviour to call, so its spec proves it says what it means.
**Check:** test
**Tags:** testing
**Implements:** `coverage-holds-all-logic`

## Documents

## every-package-ships-its-licence · SHOULD
Every package ships its licence file.
**Why:** a package is used apart from its repository, and without the licence beside it nobody can lawfully use it.
**Check:** review
**Tags:** workflow
**Implements:** `public-repository-carries-a-licence`

## package-readme-shows-install-and-extends · SHOULD
A package's README shows the install line, the one-line extends and its options.
**Why:** a consumer adopts a package from its README; one that must be read in full to start is not adopted.
**Check:** review
**Tags:** workflow
**Implements:** `readme-is-the-front-door`

## Versions and releases

## one-version-for-all-packages · MUST
All packages of a repository share one version; two packages at different versions are an error.
**Why:** one version says which packages were released together and work together.
**Check:** tool — versions
**Tags:** workflow

## versions-follow-semver · MUST
Versions follow semantic versioning: major for a breaking change of an entry, shipped with its migration; minor for an addition; patch for a fix.
**Why:** a consumer reads the version to decide whether an update is safe; a version that lies breaks them.
**Check:** review
**Tags:** workflow

## deprecation-names-replacement-and-removal · MUST
A deprecated entry names its replacement and the version that removes it. An application deletes deprecated code of its own instead.
**Why:** a deprecation without a replacement leaves the consumer stuck, and one without a removal version never ends.
**Check:** review
**Tags:** workflow

## one-tag-publishes-every-package · SHOULD
One tag publishes every public package; a version already published is skipped, so a rerun is safe.
**Why:** a release is then all or nothing, and a failed publish is repaired by running it again.
**Check:** review
**Tags:** workflow
**Implements:** `operations-idempotent-by-design`

## publishing-by-workflow-identity · MUST
The registry trusts the release job's identity and records provenance; no stored token publishes. A new package is published once by a person with two-factor authentication, then the automation owns it.
**Why:** a stored publishing token is the credential attackers want most; an identity that exists only inside the release job cannot leak.
**Check:** review
**Tags:** security
**Implements:** `least-privilege-credentials`

## changelog-from-commit-subjects · SHOULD
The changelog of a release is the commit subjects since the previous tag, features and fixes first.
**Why:** a changelog written from the history is complete by construction, and costs nothing to keep.
**Check:** review
**Tags:** workflow

## Requirements for implementation

What any tool that manages a repository of packages must provide.

## workspace-packages-linked-locally · SHOULD
The root resolves its own packages from the working tree, not from the registry.
**Why:** a change to a package is then tested by the root before it is published.
**Check:** review
**Tags:** workflow

## publishing-with-provenance-supported · MUST
The tool publishes through a CI identity with provenance, without a stored token.
**Why:** without it, the publishing rule above cannot be followed.
**Check:** review
**Tags:** security
