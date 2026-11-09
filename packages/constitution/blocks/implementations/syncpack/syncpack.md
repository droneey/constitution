---
id: syncpack
summary: Holds dependency versions and the shape of every manifest.
requires: [js-runtime, task-runner]
languages: [json]
governs: [".syncpackrc.yaml", "**/package.json"]
---

# Syncpack

> Holds the manifests.

Syncpack, the `syncpack` command, reads `.syncpackrc.yaml`, into which `constitution` writes the groups of every block in the blocks' order, and a dependency takes the first group it matches. Syncpack's default holds one version of each dependency across manifests; what is in the lockfile is out of its reach.
