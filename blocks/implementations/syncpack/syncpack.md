---
id: syncpack
summary: Holds dependency versions and the shape of every manifest.
requires: [typescript]
extends: null
abstract: false
checks: [versions, format]
languages: [typescript]
roles: []
dictionary: [Syncpack, syncpack, .syncpackrc.mjs]
governs: [".syncpackrc.mjs"]
---

# Syncpack

> Holds the manifests. `.syncpackrc.mjs` joins the parts of the constitution's release archive: `presets/syncpack/foundation/self.mjs`, its own formatting options, and `typescript.mjs`, caret ranges for production and development dependencies and the order of fields; its default holds one version of each dependency across manifests. A repository of packages joins the version groups of its package manager's part, the repository's own packages as `workspace:*`, of `foundation/package.mjs`, peer ranges left alone, and `workflow/package.mjs`, one version for every package. What is in the lockfile is out of its reach.
