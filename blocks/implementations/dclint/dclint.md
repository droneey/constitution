---
id: dclint
summary: Lints Docker Compose files.
requires: [docker]
extends: null
abstract: false
languages: []
dictionary: [dclint, DCLint, .dclintrc]
governs: [".dclintrc"]
---

# DCLint

> Lints Docker Compose files. It is a development dependency in a JavaScript repository and a pinned tool in any other. It has no `extends`: its configuration is `presets/common/dclint/foundation/docker.yaml` of the constitution's release archive, with every rule an error, and it holds every active rule of a Compose file that a linter can see.
