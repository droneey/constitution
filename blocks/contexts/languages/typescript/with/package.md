# TypeScript with package

> The manifest form of a published TypeScript package.

## manifest-exports-with-types-condition · SHOULD
`exports` in `package.json` maps each entry to its file, with a `types` condition beside `default` wherever a consumer imports code; `files` lists exactly what ships.
**Why:** a consumer's compiler finds the types of each entry, and nothing unlisted ships by accident.
**Check:** review
**Tags:** architecture
**Implements:** `package-entries-curated`

## peer-floor-in-the-manifest · SHOULD
The tool a package configures is a `peerDependencies` entry with a `>=` floor.
**Why:** the floor states the oldest version the package supports, and leaves the choice of version to the consumer.
**Check:** review
**Tags:** architecture
**Implements:** `configured-tool-is-a-peer-with-floor`
