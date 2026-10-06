# yamllint

## yamllint-rules-set-as-errors → rules-held-by-tools
`.yamllint.yaml` extends `presets/common/yamllint/foundation/self.yaml` of the constitution's release archive, which sets every rule it turns on to the level `error`.

| Why | Check | Tags |
|---|---|---|
| yamllint passes on a warning, and its defaults leave some rules at one, so a rule left there is a rule nobody holds. | review | [] |
