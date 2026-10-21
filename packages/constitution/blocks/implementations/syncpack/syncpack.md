---
id: syncpack
summary: Holds dependency versions and the shape of every manifest.
requires: [_js-runtime]
extends: null
abstract: false
languages: [json]
dictionary: [Syncpack, syncpack, .syncpackrc.mjs]
governs: [".syncpackrc.mjs"]
---

# Syncpack

> Holds the manifests.

syncpack has no `extends`, so `.syncpackrc.mjs` joins the parts, each list after the lists of the parts before it, and a dependency takes the first group it matches. A `file:` or `link:` path is left to review, which keeps it inside the repository; syncpack's default holds one version of each dependency across manifests. What is in the lockfile is out of its reach.
