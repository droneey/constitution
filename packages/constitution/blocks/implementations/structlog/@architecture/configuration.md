# Configuration

> Governs who configures structlog and its handlers.

## General

### structlog-configured-by-the-root → root-alone-configures-logging · MUST

Only the composition root configures structlog and the root logger's handler. It alone calls `structlog.configure` and sets that handler; no other code adds a handler or calls `logging.basicConfig`.

#### Why

A handler added elsewhere writes records past the chain, and `logging.basicConfig` adds one.

#### Examples

```py title="Avoid"
# src/shop/payments/infrastructure/stripe/payment_gateway_adapter.py
logger = logging.getLogger(__name__)
logger.addHandler(logging.StreamHandler())
```

```py title="Prefer"
# src/shop/payments/infrastructure/stripe/payment_gateway_adapter.py
logger = logging.getLogger(__name__)


# src/shop/root/logging.py
def configure_logging(settings: LoggingSettings) -> None:
    structlog.configure(
        processors=[*shared_processors, ProcessorFormatter.wrap_for_formatter],
        logger_factory=LoggerFactory(),
    )
    logging.getLogger().addHandler(build_handler(settings))
```
