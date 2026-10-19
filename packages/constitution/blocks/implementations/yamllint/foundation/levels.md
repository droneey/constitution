# Levels

> Governs yamllint's levels.

## General

### yamllint-rules-set-as-errors → rule-held-by-a-tool-where-one-can · MUST

`.yamllint.yaml` extends `presets/yaml/yamllint/foundation/self.yaml` of the Constitution's release archive, which sets every rule it turns on to the level `error`.

| Why | Tags |
|---|---|
| yamllint passes on a warning, and its defaults leave some rules at one, so a rule left there is a rule nobody holds. | [] |
