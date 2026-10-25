# Manifest

> Governs what the manifest of a distributed unit declares.

## What it declares

### manifest-licence-is-an-spdx-expression · MUST

The manifest names the unit's licence as an SPDX expression.

| Why |
|---|
| a consumer's licence check reads an SPDX expression exactly, and free text leaves it to guess. |

### manifest-names-the-source-repository · MUST

The manifest names the repository the unit is built from.

| Why |
|---|
| a consumer finds the source from the registry, and a version's provenance is checked against the repository the manifest names. |

### manifest-declares-the-runtime-floor · MUST

The manifest declares the lowest version of its language's runtime the unit supports.

| Why |
|---|
| a consumer on an older runtime then fails at install with a clear reason, not at run time on a feature the runtime lacks. |

### runtime-floor-within-the-ecosystems-support-window · SHOULD

A unit published for others floors its runtime no lower than the oldest release line the runtime's maintainers still support, unless its language's block names a narrower window.

| Why |
|---|
| a floor below what the runtime's maintainers support holds back every dependency the unit shares with its consumers, and keeps it running where no security fix arrives. |

### manifest-paths-resolve-in-the-packed-unit · MUST

Every path the manifest names — an entry, its types, a command — resolves inside the unit as it is packed for the registry.

| Why |
|---|
| a path that exists only in the working tree passes every local check and breaks every consumer who installs the release. |

## Dependencies

### manifest-declares-dependencies-by-range · SHOULD

The manifest declares each dependency a consumer installs with the unit by the range of versions the unit works with.

| Why |
|---|
| a consumer's package manager can then share one compatible version among every package that needs it. |

### manifest-declares-consumer-owned-dependencies-as-peers · MUST

The manifest declares a dependency the consumer owns — the tool a package configures, the host framework it plugs into — with the lowest version the package supports — as a peer where the ecosystem has peers — and never bundles or pins it.

| Why |
|---|
| the consumer owns that dependency's version, and a package that installs its own copy splits the consumer's tooling in two. |
