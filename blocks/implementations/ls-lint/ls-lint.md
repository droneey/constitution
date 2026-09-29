---
id: ls-lint
summary: Holds the names of files and folders in every language.
requires: []
extends: null
abstract: false
checks: [names]
languages: []
roles: []
dictionary: [ls-lint, .ls-lint.yaml]
governs: [".ls-lint.yaml"]
---

# ls-lint

> Holds names in any language. The check passes the parts of the constitution's release archive — `presets/ls-lint/foundation/self.yaml`, `core.yaml`, the language's part, such as `typescript.yaml`, the part of each other block whose names it knows, such as `expo.yaml`, and the part of each tool whose folder it skips, such as `stryker.yaml`, then on the architecture axis the language's tree, `architecture/typescript.yaml`, and the parts of the project's blocks (`ui`, `tanstack-router`, `expo`, `cli`, `analytics`) — then the project's own `.ls-lint.yaml`. Together they hold every active rule whose check is `tool/names`: kebab-case for every folder and file, upper-case documents excepted; `__tests__/` and `tests/` admitting only the spec, fake and fixtures forms; YAML files only as `.yaml`. What it cannot see — a spec named after the wrong file — is reviewed.
