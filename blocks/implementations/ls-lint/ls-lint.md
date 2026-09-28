---
id: ls-lint
summary: Holds the names of files and folders in every language.
requires: []
extends: null
abstract: false
checks: [names]
dictionary: [ls-lint, .ls-lint.yaml]
governs: [".ls-lint.yaml"]
---

# ls-lint

> Holds names in any language. The check passes devkit's language parts, then the constitution's `presets/ls-lint/base.yaml` and the parts of the project's blocks (`ui`, `tanstack-router`, `cli`, `analytics`), then the project's own `.ls-lint.yaml`. Together they hold every active rule whose check is `tool — names`: kebab-case for every folder and file, upper-case documents excepted; the top-level tree and a feature's `domain/` as the allowed folders; each role folder admitting only its role's suffix in the language's spelling; `__tests__/` and `tests/` admitting only the spec, fake and fixtures forms; YAML files only as `.yaml`. What it cannot see — the folders at a feature's root, a component's prefix by location, a role file outside its role folder, a spec named after the wrong file — is reviewed.
