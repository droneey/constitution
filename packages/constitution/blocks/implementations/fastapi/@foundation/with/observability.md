# Observability

> Governs how often an unexpected failure is logged.

## General

### uvicorn-error-record-of-a-handled-failure-dropped → failure-logged-once · SHOULD

Every unexpected failure is logged once, by its handler. A filter on the `uvicorn.error` logger drops the record of the same exception, which Starlette raises again after the handler has answered.

#### Why

Starlette always raises an unhandled exception again for the server, so without the filter every such failure is logged twice.

#### Examples

```py title="Avoid"
# src/shop/root/logging.py
def configure_logging() -> None:
    logging.getLogger("uvicorn.error").setLevel(logging.INFO)
```

```py title="Prefer"
# src/shop/root/logging.py
class HandledFailureFilter(logging.Filter):
    # Why: the Exception handler has logged the failure before Starlette raises it again
    def filter(self, record: logging.LogRecord) -> bool:
        return record.exc_info is None


def configure_logging() -> None:
    uvicorn_error = logging.getLogger("uvicorn.error")
    uvicorn_error.setLevel(logging.INFO)
    uvicorn_error.addFilter(HandledFailureFilter())
```
