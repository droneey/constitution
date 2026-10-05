# Package

## Layout

## package-named-after-what-it-serves · SHOULD
A package is named after what it serves: the tool it configures, or the need its primitives or tooling meet.

| Why | Check | Tags |
|---|---|---|
| the name tells a consumer what the package is for before it is installed. | review | [] |

## package-root-private · SHOULD
The root of a repository of packages is private and never published.

| Why | Check | Tags |
|---|---|---|
| the root is the repository's workspace, not a package, and a consumer who installed it would get the repository's tooling instead of a package. | review | [] |

## Entries and consumers

## configured-tool-is-a-peer-with-floor · MUST
The tool a package configures is a peer dependency with a lowest supported version, never a dependency of the package. A package takes a runtime dependency only when it runs code.

| Why | Check | Tags |
|---|---|---|
| the consumer owns the tool's version; a package that installs its own copy splits the consumer's tooling in two. | review | [] |

## root-dogfoods-every-package · SHOULD
The root of a repository of packages installs its own packages and extends them as a consumer would.

| Why | Check | Tags |
|---|---|---|
| a package the repository does not use itself is broken first in a consumer's repository. | review | [testing] |

## consumer-takes-package-by-preferred-mechanism → shared-configuration-from-one-pinned-source
A consumer takes a package by the tool's own extends, else by a one-line module that re-exports it, else by the tool's remote configuration.

| Why | Check | Tags |
|---|---|---|
| the closer to the tool's own mechanism, the less glue each consumer writes and keeps. | review | [] |

## consumers-import-package-entries → dependencies-imported-from-their-entries
In a repository of packages, the root and the other packages import a package by its name, through an entry its manifest lists, never by a path into its folder.

| Why | Check | Tags |
|---|---|---|
| a path inside a package is not part of its contract, and an import by path proves an entry no consumer can reach. | tool/imports | [] |

## package-spec-asserts-configuration-intent → coverage-holds-all-logic
Each shipped configuration has a spec that parses it and asserts its intent; code a package runs is held by the coverage gate like any other.

| Why | Check | Tags |
|---|---|---|
| a configuration package has no behaviour to call, so its spec proves it says what it means. | test | [] |

## shared-package-file-lives-once · MUST
A file several packages ship lives once, and each package holds only a copy generated from it.

| Why | Check | Tags |
|---|---|---|
| one source means a fix is made once and reaches every package, and no copy becomes a second original. | review | [] |

## generated-copy-guarded-by-spec → shared-package-file-lives-once
A copy a package ships of a shared file is rebuilt by the package's build, never edited by hand, and a spec asserts it equals its source.

| Why | Check | Tags |
|---|---|---|
| a copy that drifts from its source ships a different file than the one reviewed. | test | [testing] |

## package-ships-only-the-files-it-names · MUST
A package's manifest names the files it ships, and the package ships those and no other.

| Why | Check | Tags |
|---|---|---|
| a file the package does not name — a spec, a local configuration, a secret left in the folder — ships by accident, and every consumer installs it. | review | [security] |

## package-ships-its-types · MUST
A published package ships the types of every entry a consumer imports code from, where the consumer's type checker finds them.

| Why | Check | Tags |
|---|---|---|
| without them a consumer's type checker reads every name of the package as unchecked, and a change of its signatures breaks the consumer at run time. | review | [] |

## Documents

## every-package-ships-its-licence · SHOULD
Every package ships its licence file.

| Why | Check | Tags |
|---|---|---|
| a package is used apart from its repository, and without the licence beside it nobody can lawfully use it. | review | [] |

## package-readme-shows-install-and-extends → readme-is-the-front-door
A package's README shows the install line and the shortest use: for a configuration package, the one-line extends and its options.

| Why | Check | Tags |
|---|---|---|
| a consumer adopts a package from its README; one that must be read in full to start is not adopted. | review | [] |

## Versions and releases

## breaking-change-ships-its-migration · MUST
A breaking change of an entry ships with a migration a consumer can follow.

| Why | Check | Tags |
|---|---|---|
| a break without a migration leaves every consumer to rediscover what changed and how to follow it. | review | [] |

## publish-skips-published-versions → operations-idempotent-by-design
Publishing skips a version the registry already holds, so a failed publish is repaired by running it again.

| Why | Check | Tags |
|---|---|---|
| a publish that fails on a version already out cannot be rerun, and a half-published release stays half published. | review | [] |

## deprecation-names-replacement-and-removal → retired-code-marked-deprecated · MUST
A deprecated entry names its replacement and the version that removes it.

| Why | Check | Tags |
|---|---|---|
| a deprecation without a replacement leaves the consumer stuck, and one without a removal version never ends. | review | [] |

## publishing-by-workflow-identity → least-privilege-credentials · MUST
No stored token publishes. A new package's first version is published once by a person with two-factor authentication; every later version only by an identity issued to the run that publishes, and the registry records its provenance.

| Why | Check | Tags |
|---|---|---|
| a stored publishing token is the credential attackers want most, and an identity that exists only inside the run that publishes cannot leak; a registry may trust a run only for a package it already holds, so the first version needs a person. | review | [] |

## Requirements for implementation

What any tool that manages a repository of packages must provide.

## workspace-packages-linked-locally · SHOULD
The root resolves its own packages from the working tree, not from the registry.

| Why | Check | Tags |
|---|---|---|
| a change to a package is then tested by the root before it is published. | review | [] |

## publishing-with-provenance-supported · MUST
The tool publishes through a CI identity with provenance, without a stored token.

| Why | Check | Tags |
|---|---|---|
| without it, the publishing rule above cannot be followed. | review | [security] |
