---
id: compose
summary: Services Docker Compose runs locally, in tests and in production.
requires: [yaml]
extends: null
abstract: false
languages: []
dictionary: [Docker Compose, compose.yaml]
governs: ["**/compose.yaml", "**/compose.*.yaml"]
---

# Docker Compose

> Runs the services a project needs — its own images and those it pulls — locally, in tests and in production, from Compose files.

A Compose file is held by a linter of its own; what it does not see — the privileges a service drops, the order in which services start — is reviewed.
