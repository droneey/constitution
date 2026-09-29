---
id: docker
summary: Container images and the services Docker Compose runs from them.
requires: []
extends: null
abstract: false
checks: []
dictionary: [Docker, Dockerfile, .dockerignore, Docker Compose, compose.yaml]
governs: ["**/Dockerfile", "**/*.Dockerfile", "**/.dockerignore", "**/compose.yaml", "**/compose.*.yaml"]
---

# Docker

> Builds the images a project ships and runs its services locally, in tests and in production with Docker Compose. A Dockerfile and a Compose file are each held by a linter of their own; what neither sees — the user an image runs as, how a secret reaches a build, the order in which services start — is reviewed.
