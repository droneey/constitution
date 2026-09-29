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

> Holds the manifests. `.syncpackrc.mjs` re-exports `presets/syncpack/foundation/typescript.mjs` of the constitution's release archive — caret ranges for production and development dependencies, one version of each dependency across manifests, the order of fields — and a repository of packages joins the version groups of its package manager's part, the repository's own packages as `workspace:*`, of `foundation/package.mjs`, peer ranges left alone, and `workflow/package.mjs`, one version for every package. What is in the lockfile is out of its reach.
