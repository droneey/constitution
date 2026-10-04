---
id: pino
summary: pino writes the program's log records as JSON lines.
requires: [typescript, observability]
extends: null
abstract: false
checks: []
languages: []
roles: []
dictionary: [pino, pino-http, pino-pretty]
governs: ["**/root/**"]
---

# pino

> Writes every record — the program's and pino-http's — through one pino instance created at the program's start: secret keys masked in the finished line, the trace id added from an `AsyncLocalStorage`, JSON lines to stdout in production and pino-pretty in development. Code passes a record's fields first and its fixed message second.
