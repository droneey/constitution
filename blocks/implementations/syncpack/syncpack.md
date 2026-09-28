---
id: syncpack
summary: Holds dependency versions and the shape of every manifest.
requires: [typescript]
extends: null
abstract: false
checks: [versions, format]
dictionary: [Syncpack, syncpack, .syncpackrc.mjs]
governs: [".syncpackrc.mjs"]
---

# Syncpack

> Holds the manifests. `.syncpackrc.mjs` re-exports devkit's configuration — caret ranges for production and development dependencies, one version of each dependency across manifests, the order of fields — and a repository of packages re-exports devkit's `packages` configuration instead, which adds one version for every package, the repository's own packages as `workspace:*` and peer ranges left alone. What is in the lockfile is out of its reach.
