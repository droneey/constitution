---
id: syncpack
kind: implementation
summary: Holds dependency versions and the shape of every manifest.
chapters: []
requires: [typescript]
extends: null
abstract: false
checks: [versions, format]
owns: [Syncpack, syncpack, .syncpackrc.mjs]
governs: [".syncpackrc.mjs"]
status: stable
---

# Syncpack

> Holds the manifests. `.syncpackrc.mjs` re-exports devkit's configuration — caret ranges for production and development dependencies, one version of each dependency across manifests, the order of fields — and a repository of packages re-exports devkit's `packages` configuration instead, which adds one version for every package, the repository's own packages as `workspace:*` and peer ranges left alone. What is in the lockfile is out of its reach.

## versions-checked-and-manifests-formatted · SHOULD
The check runs `syncpack lint` and `syncpack format --check`.
**Why:** the first holds one version per dependency, the second the shared order of fields; both only read.
**Check:** tool — versions
**Tags:** workflow
**Implements:** `one-version-per-dependency`
