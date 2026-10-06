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

> Lints Docker Compose files. It is a development dependency in a JavaScript repository and a pinned tool in any other. It has no `extends`: its configuration is `presets/common/dclint/docker.yaml` of the constitution's release archive, with every rule an error, and it holds every active rule of a Compose file that a linter can see.

### dclint-rules-set-as-errors → docker-files-linted-in-the-check
Every rule the archive's `presets/common/dclint/docker.yaml` turns on is an error.

| Why | Tags |
|---|---|
| a rule left at a warning passes unfixed. | [] |

### dclint-suppression-names-rule-and-reason → suppression-silences-one-finding
A suppression is `# dclint disable-line <rule>` or `# dclint disable-next-line <rule>`, with the reason beside it.

| Why | Tags |
|---|---|
| dclint's other comments disable a rule for the whole file, which silences it for every service. | [] |
