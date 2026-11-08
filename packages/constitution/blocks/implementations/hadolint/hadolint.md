---
id: hadolint
summary: Lints Dockerfiles, their shell steps included.
requires: [dockerfile, task-runner]
languages: [dockerfile]
governs: [".hadolint.yaml"]
---

# hadolint

> hadolint, the `hadolint` command, lints Dockerfiles, and the scripts of their `RUN` steps through the shell analyser built into it.

hadolint is pinned like any other tool and reads its configuration from `.hadolint.yaml`, where `failure-threshold` sets the lowest severity that fails it and `ignored` lists the rules it turns off.
