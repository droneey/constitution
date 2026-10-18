---
id: hadolint
summary: Lints Dockerfiles, their shell steps included.
requires: [docker]
extends: null
abstract: false
languages: []
dictionary: [hadolint, .hadolint.yaml]
governs: [".hadolint.yaml"]
---

# hadolint

> Lints Dockerfiles, and the scripts of their `RUN` steps through the shell analyser built into it. It is pinned like any other tool; its configuration is `presets/common/hadolint/docker.yaml` of the Constitution's release archive, whose `failure-threshold: style` makes any finding fail. Together they hold every active rule of a Dockerfile that a linter can see.

### hadolint-suppression-names-rule-and-reason → suppression-silences-one-finding · MUST

A suppression is `# hadolint ignore=<code> # <reason>` on the line above its instruction; a rule is ignored in the configuration only where it contradicts a rule of the Constitution, with the reason above it, as the archive ignores DL3010, which asks for `ADD`.

| Why | Tags |
|---|---|
| a rule ignored in the configuration is silenced for every Dockerfile, so only one that asks for what the Constitution forbids may be. | [] |
