---
id: yamllint
kind: implementation
summary: yamllint holds the style of YAML files.
chapters: []
requires: []
extends: null
abstract: false
checks: []
owns: [yamllint, .yamllint.yaml]
governs: [".yamllint.yaml"]
status: stable
---

# yamllint

> Holds the style of YAML files. It checks no role: YAML is no language of the constitution, and a project's style rules for its YAML stay in its configuration.

## yamllint-strict-over-every-file · SHOULD
The check runs `yamllint --strict .` over every YAML file; the configuration is `.yamllint.yaml`, extending devkit's template.
**Why:** a warning that passes is a rule nobody holds, and every YAML file of the repository is read the same way.
**Check:** review
**Tags:** workflow
**Implements:** `rules-held-by-tools`
