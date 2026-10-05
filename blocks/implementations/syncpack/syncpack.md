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

> Holds the manifests. `.syncpackrc.mjs` joins the parts of the constitution's release archive in `presets/typescript/syncpack/`, the scope of the language whose manifests it reads: on foundation `typescript.mjs`, exact versions for the tools, caret ranges for the program's dependencies and the order of fields, and `self.mjs`, its own formatting options; its default holds one version of each dependency across manifests. A repository of packages joins the version groups of its package manager's part, the repository's own packages as `workspace:*`, and of the foundation `package.mjs`, peer ranges left alone. What is in the lockfile is out of its reach.
