# TypeScript with distribution

> Governs the `package.json` and the declarations of a TypeScript package others install.

## Contents

### manifest-exports-with-types-condition → distributed-unit-ships-its-types · MUST
Every entry of `exports` a consumer imports code from carries a `types` condition, first in its object, beside `default`.

| Why | Tags |
|---|---|
| the consumer's compiler finds an entry's types through that condition and takes the first condition that matches, so one placed after `default` is never reached. | [] |

### package-export-typed-explicitly → distributed-unit-ships-its-types · MUST
Every export of a package others install states its type wherever its declaration needs one — a function's return type, the type of a constant whose value is no literal — so each file's declarations are emitted from that file alone.

| Why | Tags |
|---|---|
| the declarations a consumer compiles against then change only when a signature is edited, never when a change inside a function widens what the compiler infers, and any tool can emit them file by file. | [] |

### files-list-what-ships → distributed-unit-ships-only-what-its-manifest-names · MUST
`files` in `package.json` lists exactly what the package ships.

| Why | Tags |
|---|---|
| without the list, every file the ignore rules leave in is packed, and ships by accident. | [] |

### integration-is-a-subpath-with-an-optional-peer → integration-is-an-entry-with-an-optional-framework · SHOULD
An integration is an `exports` subpath named after its framework, and the framework is a `peerDependencies` entry marked optional in `peerDependenciesMeta`.

| Why | Tags |
|---|---|
| a consumer who imports the subpath brings the framework it already uses, and one who does not is never asked to install it. | [] |

### hash-imports-rewritten-in-what-ships · MUST
A package others install ships no `#/` specifier: its build rewrites each to a relative path that names its file and extension.

| Why | Tags |
|---|---|
| the compiler leaves the specifier as written, and Node.js resolves no folder and no `#/` below its newest lines, and some runtimes read a `#/` only through a `tsconfig.json`, so a consumer fails on its first import. | [errors] |

## Manifest

### peer-floor-in-the-manifest → manifest-declares-consumer-owned-dependencies-as-peers · MUST
The tool a package configures, and the framework it plugs into, is a `peerDependencies` entry whose range opens at the lowest supported version, a caret range for each supported major joined by `||`.

| Why | Tags |
|---|---|
| the floor states the oldest version the package supports, and leaves the choice of version to the consumer. | [] |

### runtime-floor-in-engines → manifest-declares-the-runtime-floor · MUST
The runtime floor is `engines` in `package.json`: each runtime the package supports, with a `>=` floor.

| Why | Tags |
|---|---|
| the package manager reads `engines` at install, so a consumer on a runtime too old hears it there, not from a failure at run time. | [] |

### dependency-declared-with-a-caret → manifest-declares-dependencies-by-range · SHOULD
A dependency a consumer installs with the package is declared with a caret range: `^2.3.0`.

| Why | Tags |
|---|---|
| a caret takes every later release of the same major, which promises compatibility, so the consumers' package managers can share one copy. | [] |

### optional-peer-pinned-as-a-dev-dependency · SHOULD
An optional peer of a package is also a `devDependencies` entry, at the exact version the package's specs run on.

| Why | Tags |
|---|---|
| no package manager installs an optional peer, so the specs and the compiler need a copy of their own, pinned like every tool. | [] |
