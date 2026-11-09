# Checks

> Governs the tools that check each package and the checks across packages.

## Vocabulary

The **checks across packages** are the checks that read several packages at once, such as those of the imports between them.

## General

### unit-checked-by-its-own-tools → configuration-holds-what-its-blocks-compute · MUST

Each package is checked by the tools of its own blocks, run with that package's configuration.

#### Why

A tool's configuration applied from the root either misses a package's paths, as one that names `src/` does, and passes in silence, or applies one package's configuration to the others and changes their rules.

#### Examples

```text title="Avoid"
./lint.json            includes: src/**
$ lint                 from the root, over every package
apps/shop-api/src      checked by the root's settings
packages/money/lib     missed
```

```text title="Prefer"
./lint.json                  includes: *.json
apps/shop-api/lint.json      includes: src/**
packages/money/lint.json     includes: lib/**

$ lint in apps/shop-api
$ lint in packages/money
```

### package-checks-reach-only-its-own-files · MUST

No package's checks reach another package's files. Exempt: the root's checks across packages.

#### Why

A check that reaches into another package holds that package's files to settings written for its own tree, and fails or passes them by rules their own package never chose.

#### Examples

```text title="Avoid"
apps/shop-api/lint.json
  includes: src/**, ../../packages/money/src/**
```

```text title="Prefer"
apps/shop-api/lint.json
  includes: src/**
```
