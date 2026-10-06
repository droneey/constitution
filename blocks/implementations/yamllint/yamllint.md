---
id: yamllint
summary: yamllint holds the style of YAML files.
requires: []
extends: null
abstract: false
languages: []
dictionary: [yamllint, .yamllint.yaml]
governs: [".yamllint.yaml"]
---

# yamllint

> Holds the style of YAML files. It checks no role: YAML is no language of the constitution, and a project's style rules for its YAML stay in its configuration.

### yamllint-rules-set-as-errors → rules-held-by-tools
`.yamllint.yaml` extends `presets/common/yamllint/self.yaml` of the constitution's release archive, which sets every rule it turns on to the level `error`.

| Why | Tags |
|---|---|
| yamllint passes on a warning, and its defaults leave some rules at one, so a rule left there is a rule nobody holds. | [] |
