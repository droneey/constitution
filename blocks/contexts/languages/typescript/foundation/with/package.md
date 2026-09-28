# TypeScript with package

> The manifest form of a published TypeScript package.

## peer-floor-in-the-manifest · SHOULD
The tool a package configures is a `peerDependencies` entry with a `>=` floor.
**Why:** the floor states the oldest version the package supports, and leaves the choice of version to the consumer.
**Check:** review
**Tags:** architecture
**Implements:** `configured-tool-is-a-peer-with-floor`
