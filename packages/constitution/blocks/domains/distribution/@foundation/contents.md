# Contents

> Governs what a distributed package ships, how it offers its integrations and what its readme shows.

## Vocabulary

A **distributed package** is a package others install from a registry, as core's dependencies chapter defines a registry: a package whose code they import or whose configuration they extend, or a program such as a command-line tool its users install. Whoever installs it is, in this block, its consumer.

## Files

### distributed-package-ships-only-what-its-manifest-names · MUST

Every distributed package ships only the files its manifest names. Exempt: a file that packing it for its registry always includes, such as its readme, its licence file or its manifest.

#### Why

A file the manifest does not name (a spec, a local configuration, a secret left in the folder) ships by accident to every consumer.

#### Examples

```text title="Avoid"
manifest of price-kit
  files    (none named)

packed price-kit 2.1.0
├── secrets.local
├── dist/
├── src/__tests__/
├── LICENSE
└── README.md
```

```text title="Prefer"
manifest of price-kit
  files    dist/

packed price-kit 2.1.0
├── dist/
├── LICENSE
└── README.md
```

### distributed-package-ships-its-types · MUST

Wherever the package's language has a type checker, every distributed package ships the types of every entry a consumer imports code from. They lie where the consumer's type checker finds them.

#### Why

Without them a consumer's type checker reads every name of the package as unchecked, and a change of its signatures breaks the consumer at run time.

#### Examples

```text title="Avoid"
packed price-kit 2.1.0
└── dist/
    └── index
```

```text title="Prefer"
manifest of price-kit
  entry    dist/index
  types    dist/index.types

packed price-kit 2.1.0
└── dist/
    ├── index
    └── index.types
```

### distributed-package-ships-its-licence · MUST

Every distributed package ships its licence file.

#### Why

A package is used apart from its repository, and without the licence beside it nobody can lawfully use it.

#### Examples

```text title="Avoid"
packed price-kit 2.1.0
├── dist/
└── README.md
```

```text title="Prefer"
packed price-kit 2.1.0
├── dist/
├── LICENSE
└── README.md
```

### bundled-code-licence-notices-shipped · MUST

Every distributed package that bundles code of others ships the licence notices of that code.

#### Why

Most licences allow redistribution only with their notice, so a bundle without it breaks the licence of every library inside.

#### Examples

```text title="Avoid"
packed price-kit 2.1.0
├── dist/
│   └── index        bundles date-kit (MIT)
├── LICENSE
└── README.md
```

```text title="Prefer"
packed price-kit 2.1.0
├── dist/
│   └── index        bundles date-kit (MIT)
├── LICENSE
├── README.md
└── THIRD_PARTY_NOTICES   date-kit's MIT notice
```

### shipped-content-kind-has-its-own-folder → folder-has-one-purpose · SHOULD

Every kind of content a distributed package ships as written has a folder of its own at the package's root. Such kinds are, for instance, templates, schemas and presets, and the code its build compiles or bundles is none.

#### Why

Content of several kinds in one folder is told apart only by its names, so a tool or a reader that takes one kind takes the others with it.

#### Examples

```text title="Avoid"
shop-starter/
├── assets/
│   ├── invoice.html
│   ├── invoice.schema.json
│   └── strict.yaml
└── dist/
```

```text title="Prefer"
shop-starter/
├── templates/
│   └── invoice.html
├── schemas/
│   └── invoice.schema.json
├── presets/
│   └── strict.yaml
└── dist/
```

## Integrations

### integration-is-an-entry-of-its-own · SHOULD

Every distributed package's integration into a host framework is an entry of its own, never part of the package's main entry.

#### Why

An integration in the package's main entry makes every consumer load a framework only some of them use.

#### Examples

```text title="Avoid"
manifest of price-kit
  entries
    .               dist/index   prices, and the
                                 ui-framework widgets
```

```text title="Prefer"
manifest of price-kit
  entries
    .               dist/index
    ./ui-framework  dist/integrations/ui-framework/index
```

### integration-framework-an-optional-dependency · SHOULD

No host framework a distributed package integrates into is a required dependency of the package. It is declared as an optional peer where the ecosystem has peer dependencies, otherwise as a dependency installed only with the integration that needs it.

#### Why

A framework the package requires makes every consumer install a framework only some of them use.

#### Examples

```text title="Avoid"
manifest of price-kit
  dependencies
    ui-framework   >=18.0.0
```

```text title="Prefer"
manifest of price-kit
  peer dependencies
    ui-framework   >=18.0.0, optional
```

## Readme

### readme-shows-the-shortest-use · SHOULD

Every distributed package's readme shows its shortest use beside the line that installs it. For a configuration package that is the one line that extends it, with its options; for a command-line tool, its first command.

#### Why

A consumer adopts a package from its readme, and one that must be read in full to start is not adopted.

#### Examples

```text title="Avoid"
README.md

# shop-lint-config

## Install
    install shop-lint-config

See docs/ for how to use it.
```

```text title="Prefer"
README.md

# shop-lint-config

## Install
    install shop-lint-config

## Use
In the lint tool's configuration:
    extends shop-lint-config({ strict: true })
```
