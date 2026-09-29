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

> Lints Dockerfiles, and the scripts of their `RUN` steps through ShellCheck. It is pinned like any other tool; the check passes `presets/hadolint/foundation/docker.yaml` of the constitution's release archive as `--config`, whose `failure-threshold: style` fails the run on any finding. Together they hold every active rule of a Dockerfile whose check is `tool/lint`.
