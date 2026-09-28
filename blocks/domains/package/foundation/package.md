# Package

## Layout

## package-named-scope-kit-language-name · SHOULD
A package is named `<scope>/<kit>-<language>-<name>`, after what it configures.
**Why:** the name tells a consumer which kit, which language and which tool the package serves before it is installed.
**Check:** review
**Tags:** naming

## Entries and consumers

## configured-tool-is-a-peer-with-floor · MUST
The tool a package configures is a peer dependency with a lowest supported version, never a dependency of the package. A package takes a runtime dependency only when it runs code.
**Why:** the consumer owns the tool's version; a package that installs its own copy splits the consumer's tooling in two.
**Check:** review
**Tags:** design

## root-dogfoods-every-package · SHOULD
The root of a repository of packages installs its own packages and extends them as a consumer would.
**Why:** a package the repository does not use itself is broken first in a consumer's repository.
**Check:** review
**Tags:** testing

## package-spec-asserts-configuration-intent · MUST
Each shipped configuration has a spec that parses it and asserts its intent; code a package runs is held by the coverage gate like any other.
**Why:** a configuration package has no behaviour to call, so its spec proves it says what it means.
**Check:** test
**Tags:** testing
**Implements:** `coverage-holds-all-logic`

## generated-copy-guarded-by-spec · MUST
A copy a package ships of a shared file is rebuilt by the package's build, never edited by hand, and a spec asserts it equals its source.
**Why:** a copy that drifts from its source ships a different file than the one reviewed.
**Check:** test
**Tags:** testing
**Implements:** `generated-files-marked-never-edited`

## Documents

## every-package-ships-its-licence · SHOULD
Every package ships its licence file.
**Why:** a package is used apart from its repository, and without the licence beside it nobody can lawfully use it.
**Check:** review
**Tags:** process
**Implements:** `public-repository-carries-a-licence`

## package-readme-shows-install-and-extends · SHOULD
A package's README shows the install line, the one-line extends and its options.
**Why:** a consumer adopts a package from its README; one that must be read in full to start is not adopted.
**Check:** review
**Tags:** process
**Implements:** `readme-is-the-front-door`

## Versions and releases

## breaking-change-ships-its-migration · MUST
A breaking change of an entry is announced by the package's version and ships with a migration a consumer can follow.
**Why:** a break the version hides is taken as a safe update, and one without a migration leaves the consumer to rediscover it.
**Check:** review
**Tags:** process

## publish-skips-published-versions · SHOULD
Publishing skips a version the registry already holds, so a failed publish is repaired by running it again.
**Why:** a publish that fails on a version already out cannot be rerun, and a half-published release stays half published.
**Check:** review
**Tags:** process
**Implements:** `operations-idempotent-by-design`

## deprecation-names-replacement-and-removal · MUST
A deprecated entry names its replacement and the version that removes it.
**Why:** a deprecation without a replacement leaves the consumer stuck, and one without a removal version never ends.
**Check:** review
**Tags:** process

## publishing-by-workflow-identity · MUST
The registry trusts the release job's identity and records provenance; no stored token publishes. A new package is published once by a person with two-factor authentication, then the automation owns it.
**Why:** a stored publishing token is the credential attackers want most; an identity that exists only inside the release job cannot leak.
**Check:** review
**Tags:** security
**Implements:** `least-privilege-credentials`

## Requirements for implementation

What any tool that manages a repository of packages must provide.

## workspace-packages-linked-locally · SHOULD
The root resolves its own packages from the working tree, not from the registry.
**Why:** a change to a package is then tested by the root before it is published.
**Check:** review
**Tags:** process

## publishing-with-provenance-supported · MUST
The tool publishes through a CI identity with provenance, without a stored token.
**Why:** without it, the publishing rule above cannot be followed.
**Check:** review
**Tags:** security
