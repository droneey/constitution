# TypeScript with distribution

> The manifest form of a distributed TypeScript package.

### peer-floor-in-the-manifest → manifest-declares-consumer-owned-dependencies-as-peers · MUST
The tool a package configures is a `peerDependencies` entry with a `>=` floor.

| Why | Tags |
|---|---|
| the floor states the oldest version the package supports, and leaves the choice of version to the consumer. | [] |

### manifest-exports-with-types-condition → distributed-unit-ships-its-types · MUST
Wherever a consumer imports code, an entry of `exports` carries a `types` condition beside `default`.

| Why | Tags |
|---|---|
| the consumer's compiler finds an entry's types through that condition. | [] |

### files-list-what-ships → distributed-unit-ships-only-what-its-manifest-names · MUST
`files` in `package.json` lists exactly what the package ships.

| Why | Tags |
|---|---|
| without the list, every file the ignore rules leave in is packed, and ships by accident. | [] |

### integration-is-a-subpath-with-an-optional-peer → integration-is-an-entry-with-an-optional-framework · SHOULD
An integration is an `exports` subpath named after its framework; the framework is a `peerDependencies` entry marked `optional` in `peerDependenciesMeta`, and a `devDependencies` entry at the exact version the package's specs run on.

| Why | Tags |
|---|---|
| no package manager installs an optional peer, so the specs and the compiler need the development copy, while a consumer that imports the subpath brings the framework it already uses. | [] |
