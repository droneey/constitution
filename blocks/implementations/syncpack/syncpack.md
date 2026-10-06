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

> Holds the manifests. `.syncpackrc.mjs` joins the parts of the constitution's release archive in `presets/typescript/syncpack/`, the scope of the language whose manifests it reads: at the tool's root `typescript.mjs`, exact versions for the tools, caret ranges for the program's dependencies and the order of fields, and `self.mjs`, its own formatting options; its default holds one version of each dependency across manifests. A repository of several units joins the version groups of its package manager's part, the repository's own units as `workspace:*`, and one that distributes a package those of `distribution.mjs`, peer ranges left alone. What is in the lockfile is out of its reach.

### syncpack-holds-versions-and-field-order → one-version-per-dependency
Syncpack's configuration holds one version of each dependency across the manifests, and the shared order of a manifest's fields.

| Why | Tags |
|---|---|
| one version per dependency is one behaviour of it in every unit, and one order of fields shows each field where every manifest keeps it. | [] |
