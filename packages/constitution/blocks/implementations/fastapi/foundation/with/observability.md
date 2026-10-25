# Observability

> Governs how Uvicorn's own records reach the log pipeline.

## General

### uvicorn-records-join-the-pipeline → log-record-passes-one-pipeline · MUST

Uvicorn runs with `log_config=None`, so `uvicorn`, `uvicorn.error` and `uvicorn.access` keep no handler of their own, propagate, and their records pass the one pipeline.

| Why |
|---|
| Uvicorn's default configuration gives its loggers handlers of their own and stops them from propagating, so the server's records would skip the masking and the trace id. |
