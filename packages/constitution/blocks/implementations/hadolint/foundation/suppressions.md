# Suppressions

> Governs how a finding of hadolint is suppressed.

## General

### hadolint-suppression-names-rule-and-reason → suppression-silences-one-finding · MUST

A suppression is `# hadolint ignore=<code> # <reason>` on the line above its instruction. A rule is ignored in the configuration only where it contradicts a rule of the Constitution, with its reason above it, as the Constitution's presets ignore DL3010, which asks for `ADD`.

| Why |
|---|
| a suppression without its reason cannot be judged by the next reader, and hadolint reads an inline one only on the line above the instruction, where a code it names is silenced for that instruction alone; a rule ignored in the configuration is silenced for every Dockerfile, so only one that asks for what the Constitution forbids may be. |
