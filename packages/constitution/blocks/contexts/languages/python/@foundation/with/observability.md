# Observability

> Governs how Python code reaches the logging facade.

## Loggers

### logger-got-by-module-name → diagnostics-written-through-a-logger · MUST

Every module writes its diagnostics through a logger got by `logging.getLogger(__name__)`.

#### Why

A logger got by another name, such as the root's or one shared by several modules, gives its records a name that is not their module's, so levels and sinks cannot be set per package and a record does not say where it came from.

#### Examples

```py title="Avoid"
def release_stock(order_id: OrderId) -> None:
    logging.warning("Stock release retried", extra={"order_id": order_id})
```

```py title="Prefer"
_logger: Final = logging.getLogger(__name__)


def release_stock(order_id: OrderId) -> None:
    _logger.warning("Stock release retried", extra={"order_id": order_id})
```
