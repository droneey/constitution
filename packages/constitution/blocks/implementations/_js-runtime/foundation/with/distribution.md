# Distribution

> Governs the manifest and the specifiers of a package others install.

## Contents

### manifest-exports-with-types-condition → distributed-unit-ships-its-types · MUST

Every entry of `exports` a consumer imports code from carries a `types` condition, first in its object, beside `default`.

| Why |
|---|
| the consumer's compiler finds an entry's types through that condition and takes the first condition that matches, so one placed after `default` is never reached and the consumer's code goes untyped. |

### files-list-what-ships → distributed-unit-ships-only-what-its-manifest-names · MUST

`files` in `package.json` lists exactly what the package ships.

| Why |
|---|
| without the list, every file the ignore rules leave in is packed, and ships by accident. |

### hash-imports-rewritten-in-what-ships · MUST

A package others install ships no `#/` specifier. Its build rewrites each to a relative path that names its file and extension.

| Why |
|---|
| the compiler leaves the specifier as written, and Node.js resolves no folder and no `#/` below its newest lines, and some runtimes read a `#/` only through a `tsconfig.json`, so a consumer fails on its first import. |

### integration-is-a-subpath-with-an-optional-peer → integration-is-an-entry-with-an-optional-framework · SHOULD

An integration is an `exports` subpath whose framework is an optional peer. The subpath is named after its framework, and the framework is a `peerDependencies` entry marked optional in `peerDependenciesMeta`.

| Why |
|---|
| a framework declared as a dependency installs a second copy beside the consumer's own, and one declared as a required peer asks every consumer to install a framework it may never import. |

## Manifest

### peer-floor-in-the-manifest → manifest-declares-consumer-owned-dependencies-as-peers · MUST

A tool a package configures, or a framework it plugs into, is a peer whose range opens at the lowest supported version. It is a `peerDependencies` entry whose range is a caret range for each supported major, joined by `||`.

| Why |
|---|
| a range that opens above the oldest version the package supports refuses consumers it would serve, one that opens below it installs on versions it breaks, and a pinned version takes the choice of version from the consumer. |

### runtime-floor-in-engines → manifest-declares-the-runtime-floor · MUST

The runtime floor is `engines` in `package.json`: each runtime the package supports, with a `>=` floor.

| Why |
|---|
| a floor stated anywhere else is read by no package manager, so a consumer on a runtime too old learns of it from a failure at run time instead of at install, where the package manager reads `engines`. |

### dependency-declared-with-a-caret → manifest-declares-dependencies-by-range · SHOULD

A dependency a consumer installs with the package is declared with a caret range: `^2.3.0`.

| Why |
|---|
| a narrower range clashes with the range another package asks for, so each consumer installs a second copy; a caret takes every later release of the same major, which promises compatibility. |

### optional-peer-pinned-as-a-dev-dependency · SHOULD

An optional peer of a package is also a `devDependencies` entry, at the exact version the package's specs run on.

| Why |
|---|
| no package manager installs an optional peer, so without a copy of their own the specs and the compiler fail to resolve it, or run against whatever version happens to be present. |
