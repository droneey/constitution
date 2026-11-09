# Distribution

> Governs the manifest and the specifiers of a package others install.

## Contents

### manifest-exports-with-types-condition → distributed-package-ships-its-types · MUST

Every entry of `exports` a consumer imports code from carries a `types` condition, first in its object, beside `default`.

#### Why

The consumer's compiler finds an entry's types through that condition and takes the first condition that matches, so one placed after `default` is never reached and the consumer's code goes untyped.

#### Examples

```json title="Avoid"
{
  "exports": {
    ".": {
      "default": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  }
}
```

```json title="Prefer"
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  }
}
```

### files-list-what-ships → distributed-package-ships-only-what-its-manifest-names · MUST

Every package others install lists in `files` what it ships, and nothing more. Exempt: a file its registry's packing always includes, such as `package.json`, the readme or the licence.

#### Why

Without the list, every file the ignore rules leave in is packed, and ships by accident.

#### Examples

```json title="Avoid"
{
  "name": "@shop/money",
  "exports": { ".": { "types": "./dist/index.d.ts", "default": "./dist/index.js" } }
}
```

```json title="Prefer"
{
  "name": "@shop/money",
  "exports": { ".": { "types": "./dist/index.d.ts", "default": "./dist/index.js" } },
  "files": ["dist"]
}
```

### hash-imports-rewritten-in-what-ships · MUST

No package others install ships a `#/` specifier. Its build rewrites each to a relative path that names its file and extension.

#### Why

The compiler leaves the specifier as written, older release lines of the runtimes still in support resolve no folder and no `#/` specifier, and some runtimes read a `#/` only through a `tsconfig.json`, so a consumer fails on its first import.

#### Examples

```js title="Avoid"
// dist/format/format-money.js
import { roundToCent } from '#/rounding/round-to-cent';
```

```js title="Prefer"
// dist/format/format-money.js
import { roundToCent } from '../rounding/round-to-cent.js';
```

### integration-is-an-exports-subpath → integration-is-an-entry-of-its-own · SHOULD

Every integration of a package others install is an `exports` subpath named after its framework.

#### Why

An integration in the package's main entry makes every consumer load a framework only some of them use, and a subpath named otherwise does not say which framework it serves.

#### Examples

```json title="Avoid"
{
  "exports": {
    ".": { "types": "./dist/index.d.ts", "default": "./dist/index.js" },
    "./hooks": { "types": "./dist/hooks.d.ts", "default": "./dist/hooks.js" }
  }
}
```

```json title="Prefer"
{
  "exports": {
    ".": { "types": "./dist/index.d.ts", "default": "./dist/index.js" },
    "./react": { "types": "./dist/react.d.ts", "default": "./dist/react.js" }
  }
}
```

### integration-framework-an-optional-peer → integration-framework-an-optional-dependency · SHOULD

Every framework an integration plugs into is marked optional in `peerDependenciesMeta`.

#### Why

A framework declared as a required peer asks every consumer to install a framework it may never import.

#### Examples

```json title="Avoid"
{
  "peerDependencies": {
    "react": "^18.2.0 || ^19.0.0"
  }
}
```

```json title="Prefer"
{
  "peerDependencies": {
    "react": "^18.2.0 || ^19.0.0"
  },
  "peerDependenciesMeta": {
    "react": { "optional": true }
  }
}
```

## Manifest

### consumer-owned-dependency-in-peer-dependencies → consumer-owned-dependency-declared-as-a-peer · MUST

Every tool a package configures, and every framework it plugs into, is a `peerDependencies` entry.

#### Why

A tool or a framework declared in `dependencies` installs a copy of its own beside the consumer's, so the package configures or plugs into a version the consumer never chose.

#### Examples

```json title="Avoid"
{
  "name": "@shop/biome-config",
  "dependencies": {
    "@biomejs/biome": "^2.3.0"
  }
}
```

```json title="Prefer"
{
  "name": "@shop/biome-config",
  "peerDependencies": {
    "@biomejs/biome": "^2.3.0"
  }
}
```

### peer-range-a-caret-per-supported-major → consumer-owned-dependency-ranged-from-its-lowest-version · MUST

Every `peerDependencies` range opens at the lowest version the package supports. It is a caret range for each supported major, joined by `||`.

#### Why

A range that opens above the oldest version the package supports refuses consumers it would serve, one that opens below it installs on versions it breaks, and a pinned version takes the choice of version from the consumer.

#### Examples

```json title="Avoid"
{
  "peerDependencies": {
    "react": ">=16"
  }
}
```

```json title="Prefer"
{
  "peerDependencies": {
    "react": "^18.2.0 || ^19.0.0"
  }
}
```

### runtime-floor-in-engines → manifest-declares-the-runtime-floor · MUST

The runtime floor is `engines` in `package.json`: each runtime the package supports, with a `>=` floor.

#### Why

A floor stated anywhere else is read by no package manager, so a consumer on a runtime too old learns of it from a failure at run time instead of at install, where the package manager reads `engines`.

#### Examples

```json title="Avoid"
{
  "name": "@shop/money",
  "description": "Money for the shop. Needs Node 20.11 or later."
}
```

```json title="Prefer"
{
  "name": "@shop/money",
  "description": "Money for the shop.",
  "engines": { "node": ">=20.11.0", "bun": ">=1.2.0" }
}
```

### dependency-declared-with-a-caret → manifest-declares-dependencies-by-range · MUST

Every dependency a consumer installs with the package is declared with a caret range, such as `^2.3.0`, in the manifest it ships.

#### Why

A narrower range conflicts with the range another package asks for, so each consumer installs a second copy; a caret takes every later release of the same major, or of the same minor below 1.0, which promises compatibility.

#### Examples

```json title="Avoid"
{
  "dependencies": {
    "decimal.js": "10.4.3"
  }
}
```

```json title="Prefer"
{
  "dependencies": {
    "decimal.js": "^10.4.3"
  }
}
```

### optional-peer-pinned-as-a-dev-dependency · SHOULD

Every optional peer of a package is also a `devDependencies` entry, at the exact version the package's specs run on.

#### Why

No package manager installs an optional peer, so without a copy of their own the specs and the compiler fail to resolve it, or run against whatever version happens to be present.

#### Examples

```json title="Avoid"
{
  "peerDependencies": { "react": "^18.2.0 || ^19.0.0" },
  "peerDependenciesMeta": { "react": { "optional": true } }
}
```

```json title="Prefer"
{
  "peerDependencies": { "react": "^18.2.0 || ^19.0.0" },
  "peerDependenciesMeta": { "react": { "optional": true } },
  "devDependencies": { "react": "19.2.0" }
}
```
