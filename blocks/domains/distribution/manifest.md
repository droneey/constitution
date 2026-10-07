# Manifest

> Governs what the manifest of a distributed unit declares.

## What it declares

### manifest-licence-is-an-spdx-expression · MUST
The manifest names the unit's licence as an SPDX expression.

| Why | Tags |
|---|---|
| a consumer's licence check reads an SPDX expression exactly, and free text leaves it to guess. | [security] |

### manifest-names-the-source-repository · MUST
The manifest names the repository the unit is built from.

| Why | Tags |
|---|---|
| a consumer finds the source from the registry, and a version's provenance is checked against the repository the manifest names. | [security] |

### manifest-declares-the-runtime-floor · MUST
The manifest declares the lowest version of its language's runtime the unit supports.

| Why | Tags |
|---|---|
| a consumer on an older runtime then fails at install with a clear reason, not at run time on a feature the runtime lacks. | [] |

### manifest-paths-resolve-in-the-packed-unit · MUST
Every path the manifest names — an entry, its types, a command — resolves inside the unit as it is packed for the registry.

| Why | Tags |
|---|---|
| a path that exists only in the working tree passes every local check and breaks every consumer who installs the release. | [testing] |

## Dependencies

### manifest-declares-dependencies-by-range · SHOULD
The manifest declares each dependency by the range of versions the unit works with.

| Why | Tags |
|---|---|
| a consumer's package manager can then share one compatible version among every package that needs it. | [] |

### manifest-declares-consumer-owned-dependencies-as-peers · MUST
The manifest declares a dependency the consumer owns — the tool a package configures, the host framework it plugs into — as a peer, with the lowest version the package supports, and the package never installs it itself.

| Why | Tags |
|---|---|
| the consumer owns that dependency's version, and a package that installs its own copy splits the consumer's tooling in two. | [] |
