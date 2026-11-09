---
id: dclint
summary: Lints Docker Compose files.
requires: [compose, task-runner]
languages: [yaml]
governs: [".dclintrc.yaml"]
---

# DCLint

> DCLint, the `dclint` command, lints Compose files.

DCLint is a development dependency in a JavaScript repository and a pinned tool in any other. It reads its configuration from `.dclintrc.yaml`, where each of its rules takes a level from `0`, off, to `2`, an error.
