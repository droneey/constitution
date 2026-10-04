# TypeScript with package

> The manifest form of a published TypeScript package.

## peer-floor-in-the-manifest → configured-tool-is-a-peer-with-floor
The tool a package configures is a `peerDependencies` entry with a `>=` floor.

| Why | Check | Tags |
|---|---|---|
| the floor states the oldest version the package supports, and leaves the choice of version to the consumer. | review | [] |

## manifest-exports-with-types-condition → package-ships-its-types
Wherever a consumer imports code, an entry of `exports` carries a `types` condition beside `default`.

| Why | Check | Tags |
|---|---|---|
| the consumer's compiler finds an entry's types through that condition. | review | [] |

## exported-types-have-type-tests · SHOULD
A package's exported generic and conditional types are proven by type cases the compiler checks.

| Why | Check | Tags |
|---|---|---|
| a consumer relies on what such a type computes, and nothing else fails when a change computes something else. | review | [testing] |
