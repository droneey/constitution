# Shared files

> Governs a file, data or code that several packages need, and the types generated from shared data.

## General

### file-lives-once-across-units → fact-has-one-source · MUST

Every file several packages need lives once, in one package, from which every other package takes it. No copy of it is kept in another package.

#### Why

A copy becomes a second original that drifts from the one reviewed, and a fix made to one never reaches the other — a single source of truth.

#### Examples

```text title="Avoid"
apps/
├── shop-web/src/order.schema.json
└── shop-api/src/order.schema.json    a copy
```

```text title="Prefer"
apps/
├── shop-web/       imports @shop/contracts/order
└── shop-api/       imports @shop/contracts/order
packages/
└── contracts/src/order.schema.json
```

### package-cut-where-its-purpose-has-a-second-user → structure-appears-only-on-a-present-need · SHOULD

All code goes to a package of `packages/` only where its purpose has more than one user: two or more packages of the repository, in one language or in several, or a user outside the repository, as a package the repository releases to others has. Code whose purpose has one user lives in that user's source, whatever other languages the repository holds. A purpose's users are counted across its languages, so each package of a cross-language purpose that `code-in-several-languages-holds-a-unit-per-language` gives a language stands though one user alone takes it. A user is a package that imports, runs or checks the code, or a project outside the repository that adds it as a dependency.

#### Why

Kept with its one user a piece changes with it, while one cut out before its purpose has a second user guesses at a sharing that may never come, and every change to it then crosses a boundary for nothing — you aren't gonna need it.

#### Examples

```text title="Avoid"
apps/
└── shop-api/          the only user of the money helpers
packages/
└── money/             cut out for a second user to come
```

```text title="Prefer"
apps/
└── shop-api/
    └── src/shared/money/
```

## Generated types

### types-generated-in-their-languages-unit → generated-file-made-by-its-own-step · SHOULD

Every type generated from shared data is made by a step of the package of its language. No step of the package that holds the data makes it.

#### Why

A step in the package of the shared data runs every language's generator from a package that builds none of them, so it changes whenever any language's tools do, and its output lands where no package of that language builds or checks it.

#### Examples

```text title="Avoid"
packages/invoices/
├── shared/
│   ├── invoice.schema.json
│   └── build: generate ../typescript/src/invoice.ts
│              generate ../python/src/invoice.py
├── typescript/
└── python/
```

```text title="Prefer"
packages/invoices/
├── shared/
│   └── invoice.schema.json
├── typescript/
│   └── build: generate src/invoice.ts from the schema
└── python/
    └── build: generate src/invoice.py from the schema
```
