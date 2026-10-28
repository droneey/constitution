---
id: dclint
summary: Lints Docker Compose files.
requires: [compose, _task-runner]
extends: null
abstract: false
languages: [yaml]
governs: []
---

# DCLint

> Lints Docker Compose files.

**DCLint**, run as **`dclint`**, is a development dependency in a JavaScript repository and a pinned tool in any other. It reads its configuration from the command line, every rule an error, and holds every active rule of a Compose file that a linter can see.
