# Repository root

> Governs what the repository's root holds and lists.

## Vocabulary

A **language workspace** is the set of a repository's packages of one language that one package manager installs and links together.

## General

### root-holds-only-the-workspace · SHOULD

The repository's root holds no code but the declarations of its language workspaces and the configuration of its tools.

#### Why

A root with code of its own has something a package could import by accident, and something that leaks into a consumer.

#### Examples

```text title="Avoid"
./
├── manifest
├── lint.json
├── src/money.ts         code at the root
├── apps/
└── packages/
```

```text title="Prefer"
./
├── manifest
├── lint.json
├── apps/
└── packages/
    └── money/src/money.ts
```

### root-holds-one-workspace-per-language · MUST

Each language's packages form one language workspace, declared at the repository's root. Its members are every package of that language in the repository, and no package declares a language workspace of its own.

#### Why

A language workspace nested in a package is refused by one package manager and ignored by another, so its packages are never linked.

#### Examples

```text title="Avoid"
./manifest                 workspace: apps/*
apps/shop-api/manifest     workspace: packages/*
```

```text title="Prefer"
./manifest                 workspace: apps/*, packages/*
apps/shop-api/manifest     no workspace
```

### root-lists-only-what-its-own-files-need → configuration-holds-what-its-blocks-compute · MUST

The root's `constitution.yaml` lists only the blocks that the root's own files and the checks across packages need. It lists no block that only a package below it needs.

#### Why

A root that listed its packages' blocks would hold each package's files to settings written for another's tree, as a path written from one package's `src/` misses or refuses the files of the rest.

#### Examples

```yaml title="Avoid"
# constitution.yaml
domains: [workspace, version-control]
platforms: [client/browser]  # only apps/shop-web needs it
implementations: [biome, react, vite]
```

```yaml title="Prefer"
# constitution.yaml
domains: [workspace, version-control]
implementations: [biome]
---
# apps/shop-web/constitution.yaml
platforms: [client/browser]
implementations: [biome, react, vite]
```
