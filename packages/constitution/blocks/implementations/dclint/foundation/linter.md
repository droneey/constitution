# Linter

> Governs dclint's rules and its suppressions.

## General

### dclint-rules-set-as-errors → docker-files-linted-in-the-check · MUST

Every rule the archive's `presets/common/dclint/foundation/docker.yaml` turns on is an error.

| Why | Tags |
|---|---|
| a rule left at a warning passes unfixed. | [] |

### dclint-suppression-names-rule-and-reason → suppression-silences-one-finding · MUST

A suppression is `# dclint disable-line <rule>` or `# dclint disable-next-line <rule>`, with the reason beside it.

| Why | Tags |
|---|---|
| dclint's other comments disable a rule for the whole file, which silences it for every service. | [] |
