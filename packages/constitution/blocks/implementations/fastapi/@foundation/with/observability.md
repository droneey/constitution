# Observability

> Governs how often an unexpected failure is logged.

## General

### uvicorn-error-record-of-a-handled-failure-dropped → failure-logged-once · SHOULD

Every unexpected failure is logged once, by its handler. A filter on the `uvicorn.error` logger drops the record of the same exception, which Starlette raises again after the handler has answered.

| Why |
|---|
| Starlette always raises an unhandled exception again for the server, so without the filter every such failure is logged twice. |
