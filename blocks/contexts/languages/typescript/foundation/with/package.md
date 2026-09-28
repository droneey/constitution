# TypeScript with package

> The manifest form of a published TypeScript package.

## peer-floor-in-the-manifest · MUST
The tool a package configures is a `peerDependencies` entry with a `>=` floor.
**Why:** the floor states the oldest version the package supports, and leaves the choice of version to the consumer.
**Check:** review
**Tags:** design
**Implements:** `configured-tool-is-a-peer-with-floor`

## manifest-exports-with-types-condition · SHOULD
Wherever a consumer imports code, an entry of `exports` carries a `types` condition beside `default`; `files` lists exactly what ships.
**Why:** a consumer's compiler finds the types of each entry, and nothing unlisted ships by accident.
**Check:** review
**Tags:** types
