# Observability

> Governs how fastmcp's own records reach the log pipeline.

## General

### fastmcp-records-join-the-pipeline → log-record-passes-one-pipeline · MUST

Every record of fastmcp's passes the one pipeline. The program runs with `FASTMCP_LOG_ENABLED=false`, or its logging configuration removes the handlers fastmcp gives its `fastmcp` logger at import and lets the logger propagate.

#### Why

At import fastmcp gives its logger handlers of its own and stops it from propagating, so its records would skip the masking and the trace id.

#### Examples

```py title="Avoid"
# src/shop/root/logging.py
def configure_logging() -> None:
    logging.getLogger().addHandler(build_pipeline_handler())
```

```py title="Prefer"
# src/shop/root/logging.py
def configure_logging() -> None:
    logging.getLogger().addHandler(build_pipeline_handler())
    fastmcp_logger = logging.getLogger("fastmcp")
    for handler in tuple(fastmcp_logger.handlers):
        fastmcp_logger.removeHandler(handler)
    fastmcp_logger.propagate = True
```
