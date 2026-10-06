# FastAPI with structlog

### uvicorn-records-join-the-chain → one-chain-for-every-record
Uvicorn runs with `log_config=None`, so `uvicorn`, `uvicorn.error` and `uvicorn.access` keep no handler of their own and their records pass the root logger's chain.

| Why | Tags |
|---|---|
| Uvicorn's default configuration gives its loggers handlers of their own and stops them from propagating, so the server's records would skip the masking and the trace id. | [security] |
