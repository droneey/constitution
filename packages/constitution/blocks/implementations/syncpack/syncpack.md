---
id: syncpack
summary: Holds dependency versions and the shape of every manifest.
requires: [_js-runtime, yaml]
extends: null
abstract: false
languages: [json]
governs: [".syncpackrc.yaml"]
---

# Syncpack

> Holds the manifests.

**Syncpack**, the **`syncpack`** command, reads **`.syncpackrc.yaml`**{#syncpack-settings}, into which `constitution` writes the groups of every block in the blocks' order, and a dependency takes the first group it matches. A `file:` or `link:` path is left to review, which keeps it inside the repository; syncpack's default holds one version of each dependency across manifests. What is in the lockfile is out of its reach.
