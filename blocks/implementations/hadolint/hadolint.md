---
id: hadolint
summary: Lints Dockerfiles, their shell steps included.
requires: [docker]
extends: null
abstract: false
checks: [lint]
languages: []
roles: []
dictionary: [hadolint, .hadolint.yaml]
governs: [".hadolint.yaml"]
---

# hadolint

> Lints Dockerfiles, and the scripts of their `RUN` steps through ShellCheck. It is pinned like any other tool; its configuration is `presets/common/hadolint/foundation/docker.yaml` of the constitution's release archive, whose `failure-threshold: style` makes any finding fail. Together they hold every active rule of a Dockerfile whose check is `tool/lint`.
