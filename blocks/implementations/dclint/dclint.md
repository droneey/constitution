---
id: dclint
summary: Lints Docker Compose files.
requires: [docker]
extends: null
abstract: false
checks: [lint]
languages: []
roles: []
dictionary: [dclint, DCLint, .dclintrc]
governs: [".dclintrc"]
---

# DCLint

> Lints Docker Compose files. It is a development dependency in a JavaScript repository and a pinned tool in any other. It has no `extends`: the check passes `presets/dclint/foundation/docker.yaml` of the constitution's release archive as `--config`, with every rule an error, and holds every active rule of a Compose file whose check is `tool/lint`.
