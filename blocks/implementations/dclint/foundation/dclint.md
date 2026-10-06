# DCLint

## dclint-rules-set-as-errors → docker-files-linted-in-the-check
Every rule the archive's `presets/common/dclint/foundation/docker.yaml` turns on is an error.

| Why | Check | Tags |
|---|---|---|
| a rule left at a warning passes unfixed. | tool/lint | [] |

## dclint-suppression-names-rule-and-reason → suppression-silences-one-finding
A suppression is `# dclint disable-line <rule>` or `# dclint disable-next-line <rule>`, with the reason beside it.

| Why | Check | Tags |
|---|---|---|
| dclint's other comments disable a rule for the whole file, which silences it for every service. | review | [] |
