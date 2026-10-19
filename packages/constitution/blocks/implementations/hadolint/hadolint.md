---
id: hadolint
summary: Lints Dockerfiles, their shell steps included.
requires: [docker]
extends: null
abstract: false
languages: []
dictionary: [hadolint]
governs: []
---

# hadolint

> Lints Dockerfiles, and the scripts of their `RUN` steps through the shell analyser built into it.

hadolint is pinned like any other tool and reads its configuration from the command line; any finding fails it. Together, hadolint and its configuration hold every active rule of a Dockerfile that a linter can see.
