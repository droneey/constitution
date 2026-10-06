# Distribution

## What it ships

## named-after-what-it-serves · SHOULD
A unit others install is named after what it serves: the tool it configures, the need its primitives or tooling meet, or the job its command does.

| Why | Check | Tags |
|---|---|---|
| the name tells a consumer what the unit is for before it is installed. | review | [] |

## ships-only-the-files-it-names · MUST
A distributed unit's manifest names the files it ships, and the unit ships those and no other.

| Why | Check | Tags |
|---|---|---|
| a file the unit does not name — a spec, a local configuration, a secret left in the folder — ships by accident, and every consumer installs it. | review | [security] |

## ships-its-types · MUST
A distributed unit ships the types of every entry a consumer imports code from, where the consumer's type checker finds them.

| Why | Check | Tags |
|---|---|---|
| without them a consumer's type checker reads every name of the unit as unchecked, and a change of its signatures breaks the consumer at run time. | review | [] |

## ships-its-licence · SHOULD
A distributed unit ships its licence file.

| Why | Check | Tags |
|---|---|---|
| a unit is used apart from its repository, and without the licence beside it nobody can lawfully use it. | review | [] |

## readme-shows-install-and-first-use → readme-is-the-front-door
A distributed unit's README shows the install line and the shortest use: for a configuration package, the one-line extends and its options; for a command-line tool, its first command.

| Why | Check | Tags |
|---|---|---|
| a consumer adopts a unit from its README; one that must be read in full to start is not adopted. | review | [] |

## Consumers

## configured-tool-is-a-peer-with-floor · MUST
The consumer installs the tool a package configures: the package never depends on it, and declares the lowest version of it that it supports wherever its language's manifest can say so. A package takes a runtime dependency only when it runs code.

| Why | Check | Tags |
|---|---|---|
| the consumer owns the tool's version; a package that installs its own copy splits the consumer's tooling in two. | review | [] |

## shipped-configuration-asserted-by-spec → spec-per-boundary · MUST
Each distributed configuration has a spec that parses it and asserts its intent.

| Why | Check | Tags |
|---|---|---|
| a configuration has no behaviour to call, so its spec proves it says what it means. | test | [] |

## Versions and releases

## breaking-change-ships-its-migration · MUST
A breaking change of an entry ships with a migration a consumer can follow.

| Why | Check | Tags |
|---|---|---|
| a break without a migration leaves every consumer to rediscover what changed and how to follow it. | review | [] |

## deprecation-names-replacement-and-removal → retired-code-marked-deprecated · MUST
A deprecated entry names its replacement and the version that removes it.

| Why | Check | Tags |
|---|---|---|
| a deprecation without a replacement leaves the consumer stuck, and one without a removal version never ends. | review | [] |

## publish-skips-published-versions → operations-idempotent-by-design
Publishing skips a version the registry already holds, so a failed publish is repaired by running it again.

| Why | Check | Tags |
|---|---|---|
| a publish that fails on a version already out cannot be rerun, and a half-published release stays half published. | review | [] |

## publishing-by-workflow-identity → least-privilege-credentials · MUST
No stored token publishes. A new unit's first version is published once by a person with two-factor authentication; every later version only by an identity issued to the run that publishes, and the registry records its provenance.

| Why | Check | Tags |
|---|---|---|
| a stored publishing token is the credential attackers want most, and an identity that exists only inside the run that publishes cannot leak; a registry may trust a run only for a unit it already holds, so the first version needs a person. | review | [] |

## Requirements for implementation

What any tool that publishes a distributed unit must provide.

## publishing-with-provenance-supported · MUST
The tool publishes through a CI identity with provenance, without a stored token.

| Why | Check | Tags |
|---|---|---|
| without it, the publishing rule above cannot be followed. | review | [security] |
