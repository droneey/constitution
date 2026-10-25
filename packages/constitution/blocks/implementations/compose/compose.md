---
id: compose
summary: Services Docker Compose runs locally, in tests and in production.
requires: [yaml]
extends: null
abstract: false
languages: []
governs: ["**/compose.yaml", "**/compose.*.yaml"]
---

# Docker Compose

> Runs, through **Docker Compose**, the services a project needs — its own images and those it pulls — locally, in tests and in production, from Compose files, **`compose.yaml`** and its variants.

A Compose file is held by a linter of its own; what it does not see — the privileges a service drops, the order in which services start — is reviewed.
