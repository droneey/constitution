# Suppressions

> Governs how a finding of hadolint is suppressed.

## General

### hadolint-suppression-names-rule-and-reason → suppression-silences-one-finding · MUST

A suppression is `# hadolint ignore=<code> # <reason>` on the line above its instruction; a rule is ignored in the configuration only where it contradicts a rule of the Constitution, with the reason above it, as the archive ignores DL3010, which asks for `ADD`.

| Why |
|---|
| a rule ignored in the configuration is silenced for every Dockerfile, so only one that asks for what the Constitution forbids may be. |
