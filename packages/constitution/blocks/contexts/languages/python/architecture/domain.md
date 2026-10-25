# Domain

> Governs the domain's logging.

## Where rules live

### domain-imports-no-logging → domain-logs-nothing · MUST

A feature's `domain/` imports neither `logging` nor a logging library.

| Why |
|---|
| a domain that cannot reach a logger returns what happened to its caller, which decides what an operator is told. |
