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

> Lints Dockerfiles, and the scripts of their `RUN` steps through the shell analyser built into it.

hadolint is pinned like any other tool; its configuration is `presets/common/hadolint/foundation/docker.yaml` of the Constitution's release archive, whose `failure-threshold: style` makes any finding fail. Together, hadolint and its configuration hold every active rule of a Dockerfile that a linter can see.
