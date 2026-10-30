# Suppressions

> Governs how a finding of hadolint is suppressed.

## General

### hadolint-suppression-names-rule-and-reason → suppression-silences-one-finding · MUST

A suppression is `# hadolint ignore=<code> # <reason>` on the line above its instruction.

| Why |
|---|
| hadolint reads an inline suppression only on the line above the instruction, and a code it names there is silenced for that instruction alone. |
