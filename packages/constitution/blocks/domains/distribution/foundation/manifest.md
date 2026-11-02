# Manifest

> Governs what the manifest of a distributed unit declares.

## What it declares

### manifest-licence-is-an-spdx-expression · MUST

The manifest names the unit's licence as an SPDX expression.

| Why |
|---|
| a consumer's licence check reads an SPDX expression exactly, and free text leaves it to guess — SPDX. |

### manifest-names-the-source-repository · MUST

The manifest names the repository the unit is built from.

| Why |
|---|
| without it a consumer cannot find the source from the registry, and a version's provenance has no repository to be checked against. |

### manifest-paths-resolve-in-the-packed-unit · MUST

Every path the manifest names resolves in the packed unit. An entry, its types and a command each resolve inside the unit as it is packed for the registry.

| Why |
|---|
| a path that exists only in the working tree passes every local check and breaks every consumer who installs the release. |

## Dependencies

### manifest-declares-dependencies-by-range · SHOULD

The manifest declares a dependency by the range of versions the unit works with. This holds for each dependency a consumer installs with the unit.

| Why |
|---|
| a dependency pinned to one version makes a consumer's package manager install a second copy beside the one its other packages share, and the two copies drift apart. |

### manifest-declares-consumer-owned-dependencies-as-peers · MUST

The manifest declares a dependency the consumer owns by the lowest version the package supports, and never bundles or pins it. Such a dependency — the tool a package configures, the host framework it plugs into — is declared as a peer where the ecosystem has peers.

| Why |
|---|
| the consumer owns that dependency's version, and a package that installs its own copy splits the consumer's tooling in two. |
