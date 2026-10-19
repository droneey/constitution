---
id: syncpack
summary: Holds dependency versions and the shape of every manifest.
requires: [typescript]
extends: null
abstract: false
languages: [typescript]
dictionary: [Syncpack, syncpack, .syncpackrc.mjs]
governs: [".syncpackrc.mjs"]
---

# Syncpack

> Holds the manifests.

`.syncpackrc.mjs` joins the parts of the Constitution's release archive in `presets/typescript/syncpack/`, the scope of the language whose manifests it reads: in `foundation/` `typescript.mjs`, exact versions for the tools and caret ranges for the program's dependencies, `self.mjs`, its own formatting options and the order of fields, and `core.mjs`, which bans a dependency from the address of a source repository or of an archive, while a `file:` or `link:` path is left to review, which keeps it inside the repository; its default holds one version of each dependency across manifests. A repository of several units joins the version groups of its package manager's part, the repository's own units as `workspace:*`, and one that distributes a package those of `distribution.mjs`, peer ranges left alone. What is in the lockfile is out of its reach.
