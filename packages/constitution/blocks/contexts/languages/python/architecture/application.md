# Application

> Governs the use cases in Python: the logging the domain and the application never import.

## Use cases

### domain-and-application-import-no-logging → domain-and-application-log-nothing · MUST

A feature's `domain/` and `application/` import neither `logging` nor a logging library.

| Why |
|---|
| a use case that cannot reach a logger returns what happened to its caller, which decides what an operator is told. |
