# Linter

> Governs dclint's rules and its suppressions.

## General

### dclint-rules-set-as-errors → rule-held-by-a-tool-where-one-can · MUST

Every rule the presets turn on is an error.

| Why |
|---|
| a rule left at a warning passes unfixed. |

### dclint-suppression-names-rule-and-reason → suppression-silences-one-finding · MUST

A suppression is `# dclint disable-line <rule>` or `# dclint disable-next-line <rule>`, with the reason beside it.

| Why |
|---|
| dclint's other comments disable a rule for the whole file, which silences it for every service. |
