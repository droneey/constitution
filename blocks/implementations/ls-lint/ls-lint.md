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

> Holds names in any language. Its configuration holds every active rule whose check is `tool — names`: kebab-case for every folder and file, upper-case root files excepted; the top-level and feature anatomy as the allowed folders; each role folder admitting only its role's suffix in the language's spelling; `__tests__/` admitting only the spec, fake and fixtures forms; YAML files only as `.yaml`; no surface file in a layer folder. What it cannot see — a role file outside its role folder, a spec named after the wrong file — is reviewed.

## ls-lint-config-ends-in-yaml · SHOULD
The configuration is `.ls-lint.yaml`, passed with `--config`.
**Why:** the default name ends in the spelling the constitution forbids.
**Check:** tool — names
**Tags:** naming
**Implements:** `yaml-files-end-in-yaml`
