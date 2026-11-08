---
id: structlog
summary: structlog renders the records of Python's logging as events.
requires: [python, observability]
languages: []
governs: ["**/libs/**", "**/root/**", "**/infrastructure/**", "**/presentation/**"]
---

# structlog

> The `structlog` package renders every record of the standard library's `logging` — the program's, its libraries' and its server's — through one chain of processors: the context of the request bound through `contextvars`, secrets masked, JSON in production and readable lines in development.
