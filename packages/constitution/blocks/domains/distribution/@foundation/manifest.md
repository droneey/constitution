# Manifest

> Governs what the manifest of a distributed package declares.

## Vocabulary

A **consumer-owned dependency** is a dependency of a distributed package whose version its consumer chooses, such as the tool the package configures or the host framework it plugs into.

## What it declares

### manifest-licence-is-an-spdx-expression · MUST

Every distributed package's manifest names its licence as an SPDX expression.

#### Why

A consumer's licence check reads an SPDX expression exactly, and free text leaves it to guess — SPDX.

#### Examples

```text title="Avoid"
manifest of price-kit
  version     2.1.0
  licence     MIT-style, see LICENSE
```

```text title="Prefer"
manifest of price-kit
  version     2.1.0
  licence     MIT OR Apache-2.0
```

### manifest-names-the-source-repository · MUST

Every distributed package's manifest names the repository the package is built from.

#### Why

Without it a consumer cannot find the source from the registry, and a version's provenance has no repository to be checked against.

#### Examples

```text title="Avoid"
manifest of price-kit
  version     2.1.0
  licence     MIT
  homepage    https://price-kit.example
```

```text title="Prefer"
manifest of price-kit
  version     2.1.0
  licence     MIT
  homepage    https://price-kit.example
  repository  https://code.example/shop/price-kit
```

### manifest-paths-resolve-in-the-packed-package · MUST

Every path a distributed package's manifest names resolves inside the package as it is packed for the registry. Such paths include an entry, its types and a command.

#### Why

A path that exists only in the working tree passes every local check and breaks every consumer who installs the release.

#### Examples

```text title="Avoid"
manifest of price-kit
  entry    src/index
  types    src/index.types
  files    dist/

packed price-kit 2.1.0
└── dist/
    ├── index
    └── index.types
```

```text title="Prefer"
manifest of price-kit
  entry    dist/index
  types    dist/index.types
  files    dist/

packed price-kit 2.1.0
└── dist/
    ├── index
    └── index.types
```

## Dependencies

### manifest-declares-dependencies-by-range · SHOULD

Every dependency a consumer installs with a distributed package is declared by the range of versions the package works with.

#### Why

A dependency pinned to one version makes a consumer's package manager install a second copy beside the one its other packages share, and the two copies drift apart.

#### Examples

```text title="Avoid"
manifest of price-kit
  dependencies
    date-kit   3.4.1
```

```text title="Prefer"
manifest of price-kit
  dependencies
    date-kit   >=3.4.1 <4
```

### dependency-capped-only-with-its-reason · SHOULD

No distributed package caps a dependency without the cap's reason beside it. A cap is an upper bound on the dependency's versions short of the next release its versioning marks as breaking, and its reason stands in a comment beside it or, where the manifest's format takes none, in a file beside the manifest.

#### Why

A cap is a decision that blocks every later release, its fixes included, so one with no reason is never lifted, since nobody can tell whether it still holds.

#### Examples

```text title="Avoid"
manifest of price-kit
  dependencies
    date-kit   >=3.4.1 <3.6
```

```text title="Prefer"
manifest of price-kit
  dependencies
    # Why: 3.6.0 reads a bare date as UTC,
    # date-kit issue 812
    date-kit   >=3.4.1 <3.6
```

### consumer-owned-dependency-ranged-from-its-lowest-version · MUST

Every consumer-owned dependency of a distributed package is declared by a range from the lowest version the package supports, never pinned.

#### Why

The consumer owns that dependency's version, and a package that pins its own splits the consumer's tooling in two.

#### Examples

```text title="Avoid"
manifest of shop-lint-config
  peer dependencies
    lint-tool   9.4.0
```

```text title="Prefer"
manifest of shop-lint-config
  peer dependencies
    lint-tool   >=9.0.0
```

### consumer-owned-dependency-declared-as-a-peer · MUST

Wherever the ecosystem has peer dependencies, every consumer-owned dependency of a distributed package is declared as a peer.

#### Why

A consumer-owned dependency declared as an ordinary one installs a copy of its own beside the consumer's, so the package configures or plugs into a version the consumer never chose.

#### Examples

```text title="Avoid"
manifest of shop-lint-config
  dependencies
    lint-tool   >=9.0.0
```

```text title="Prefer"
manifest of shop-lint-config
  peer dependencies
    lint-tool   >=9.0.0
```

### consumer-owned-dependency-never-bundled · MUST

No distributed package bundles a consumer-owned dependency.

#### Why

A bundled copy runs beside the consumer's own, so the package configures or plugs into a copy the consumer never sees and the two drift apart.

#### Examples

```text title="Avoid"
packed price-kit-widgets 2.1.0
└── dist/
    ├── index
    └── vendor/
        └── ui-framework/   a copy of the host framework
```

```text title="Prefer"
packed price-kit-widgets 2.1.0
└── dist/
    └── index

manifest of price-kit-widgets
  peer dependencies
    ui-framework   >=18.0.0
```
