# Observability

> Governs how Uvicorn's records reach the log pipeline.

## General

### uvicorn-records-join-the-pipeline → log-record-passes-one-pipeline · MUST

Every record of Uvicorn's passes the one pipeline. Uvicorn runs with `log_config=None`, so `uvicorn`, `uvicorn.error` and `uvicorn.access` keep no handler of their own and propagate.

| Why |
|---|
| Uvicorn's default `log_config` gives `uvicorn` and `uvicorn.access` handlers of their own and stops them from propagating, so the server's records would skip the masking and the trace id. |
