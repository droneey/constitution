# Suppressions

> Governs dclint's suppressions.

## General

### dclint-disable-line-comment → suppression-silences-one-finding · MUST

Every dclint suppression is a `# dclint disable-line <rule>` comment naming its rule. It stands on the line it silences or alone on the line above it, never as a `# dclint disable` that covers the file.

| Why |
|---|
| a `disable-line` that names no rule silences every rule on its line, and `# dclint disable` silences its rules for every service of the file. |
