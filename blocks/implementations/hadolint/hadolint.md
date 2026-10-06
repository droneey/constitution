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

> Lints Dockerfiles, and the scripts of their `RUN` steps through ShellCheck. It is pinned like any other tool; its configuration is `presets/common/hadolint/docker.yaml` of the constitution's release archive, whose `failure-threshold: style` makes any finding fail. Together they hold every active rule of a Dockerfile that a linter can see.

### hadolint-suppression-names-rule-and-reason → suppression-silences-one-finding
A suppression is `# hadolint ignore=<code>` on the line above its instruction, with the reason beside it; never a rule ignored in the configuration.

| Why | Tags |
|---|---|
| a rule ignored in the configuration is silenced for every Dockerfile. | [] |
