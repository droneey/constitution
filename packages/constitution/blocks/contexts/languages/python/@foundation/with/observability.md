# Observability

> Governs how Python code reaches the logging facade.

## Loggers

### logger-got-by-module-name → diagnostics-written-through-a-logger · MUST

Every module writes its diagnostics through a logger got by `logging.getLogger(__name__)`.

| Why |
|---|
| a logger got by another name, such as the root's or one shared by several modules, gives its records a name that is not their module's, so levels and sinks cannot be set per package and a record does not say where it came from. |
