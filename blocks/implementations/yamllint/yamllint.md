---
id: yamllint
summary: yamllint holds the style of YAML files.
requires: [yaml]
extends: null
abstract: false
languages: [yaml]
dictionary: [yamllint, .yamllint.yaml]
governs: [".yamllint.yaml"]
---

# yamllint

> Holds the style of YAML files; a project's own style rules for its YAML stay in its configuration.

### yamllint-rules-set-as-errors → rule-held-by-a-tool-where-one-can
`.yamllint.yaml` extends `presets/yaml/yamllint/self.yaml` of the constitution's release archive, which sets every rule it turns on to the level `error`.

| Why | Tags |
|---|---|
| yamllint passes on a warning, and its defaults leave some rules at one, so a rule left there is a rule nobody holds. | [] |
