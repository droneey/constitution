---
id: ls-lint
kind: implementation
summary: Holds the names of files and folders in every language.
chapters: []
requires: []
extends: null
abstract: false
checks: [names]
owns: [ls-lint, .ls-lint.yaml]
governs: [".ls-lint.yaml"]
status: stable
---

# ls-lint

> Holds names in any language. The check passes devkit's language parts, then the constitution's `presets/ls-lint/base.yaml`, then the project's own `.ls-lint.yaml`. Together they hold every active rule whose check is `tool — names`: kebab-case for every folder and file, upper-case documents excepted; the top-level tree and a feature's `domain/` as the allowed folders; each role folder admitting only its role's suffix in the language's spelling; `__tests__/` and `tests/` admitting only the spec, fake and fixtures forms; YAML files only as `.yaml`. What it cannot see — the folders at a feature's root, a role file outside its role folder, a spec named after the wrong file — is reviewed.

## ls-lint-config-ends-in-yaml · SHOULD
The configuration is `.ls-lint.yaml`, passed with `--config`.
**Why:** the default name ends in the spelling the constitution forbids.
**Check:** tool — names
**Tags:** naming
**Implements:** `yaml-files-end-in-yaml`
