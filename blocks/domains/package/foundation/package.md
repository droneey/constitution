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

## package-spec-asserts-configuration-intent → coverage-holds-all-logic
Each shipped configuration has a spec that parses it and asserts its intent; code a package runs is held by the coverage gate like any other.

| Why | Check | Tags |
|---|---|---|
| a configuration package has no behaviour to call, so its spec proves it says what it means. | test | [] |

## generated-copy-guarded-by-spec → generated-files-marked-never-edited
A copy a package ships of a shared file is rebuilt by the package's build, never edited by hand, and a spec asserts it equals its source.

| Why | Check | Tags |
|---|---|---|
| a copy that drifts from its source ships a different file than the one reviewed. | test | [testing] |

## shared-package-file-lives-once → generated-copy-guarded-by-spec
A file several packages ship lives once, and each package holds only a copy generated from it.

| Why | Check | Tags |
|---|---|---|
| one source means a fix is made once and reaches every package, and no copy becomes a second original. | review | [] |

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
A breaking change of an entry is announced by the package's version and ships with a migration a consumer can follow.

| Why | Check | Tags |
|---|---|---|
| a break the version hides is taken as a safe update, and one without a migration leaves the consumer to rediscover it. | review | [] |

## publish-skips-published-versions → operations-idempotent-by-design
Publishing skips a version the registry already holds, so a failed publish is repaired by running it again.

| Why | Check | Tags |
|---|---|---|
| a publish that fails on a version already out cannot be rerun, and a half-published release stays half published. | review | [] |

## deprecation-names-replacement-and-removal → retired-code-marked-deprecated · MUST
A deprecated entry also names the version that removes it.

| Why | Check | Tags |
|---|---|---|
| a deprecation without a replacement leaves the consumer stuck, and one without a removal version never ends. | review | [] |

## publishing-by-workflow-identity → least-privilege-credentials · MUST
The registry trusts the release job's identity and records provenance; no stored token publishes. A new package is published once by a person with two-factor authentication, then the automation owns it.

| Why | Check | Tags |
|---|---|---|
| a stored publishing token is the credential attackers want most; an identity that exists only inside the release job cannot leak. | review | [] |

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
