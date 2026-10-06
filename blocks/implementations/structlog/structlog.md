---
id: structlog
summary: structlog renders the records of Python's logging as events.
requires: [python, observability]
extends: null
abstract: false
languages: []
dictionary: [structlog]
governs: ["**/root/**"]
---

# structlog

> Renders every record of the standard library's `logging` — the program's, its libraries' and its server's — through one chain of processors: the context of the request bound through `contextvars`, secrets masked, JSON in production and readable lines in development. Code logs through `logging.getLogger(__name__)`, and only the program's start configures structlog.
