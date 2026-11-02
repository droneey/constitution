# Suppressions

> Governs dclint's suppressions.

## General

### dclint-suppression-names-rule-and-reason → suppression-silences-one-finding · MUST

A suppression is `# dclint disable-line <rule>` or `# dclint disable-next-line <rule>`, with the reason beside it.

| Why |
|---|
| dclint's other comments disable a rule for the whole file, which silences it for every service. |
