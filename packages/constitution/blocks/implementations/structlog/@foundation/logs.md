# Logs

> Governs the chain every record passes: its fields, mask, output and trace id.

## Calls

### fields-passed-in-extra → log-record-is-an-event-with-fields · SHOULD

Every value of a record is a field passed in `extra`, never a `%s` argument or an f-string in the message.

#### Why

A value formatted into the message reaches the collector as text no query can filter on, while `extra` is how the standard logger carries a field, which `ExtraAdder` lifts into the event.

#### Examples

```py title="Avoid"
logger.info(f"order {order.id} placed for {order.total}")
```

```py title="Prefer"
logger.info("order placed", extra={"order_id": order.id, "total": str(order.total)})
```

### extra-field-named-apart-from-record-attributes → log-record-is-an-event-with-fields · MUST

Every field passed in `extra` takes a name no `LogRecord` attribute holds, such as `name`, `message` or `args`.

#### Why

`logging` raises `KeyError` at the call for a field named like a `LogRecord` attribute, so the code that logs fails with it.

#### Examples

```py title="Avoid"
logger.info("product added", extra={"name": product.name, "args": cart_line.quantity})
```

```py title="Prefer"
logger.info("product added", extra={"product_name": product.name, "quantity": cart_line.quantity})
```

## Chain

### one-chain-for-every-record → log-record-passes-one-pipeline · MUST

Every record passes one structlog chain over the standard library. The one handler on the root logger formats with a `structlog.stdlib.ProcessorFormatter` whose `foreign_pre_chain` runs the same processors, `ExtraAdder` among them.

#### Why

`foreign_pre_chain` is what runs the processors over a record a library or the server wrote through the standard logger; without it, those records skip them.

#### Examples

```py title="Avoid"
structlog.configure(processors=[merge_contextvars, add_log_level, mask_secrets, JSONRenderer()])
logging.basicConfig(level=logging.INFO)
```

```py title="Prefer"
shared_processors: list[Processor] = [merge_contextvars, add_log_level, ExtraAdder(), mask_secrets]

formatter = ProcessorFormatter(
    foreign_pre_chain=shared_processors,
    processors=[ProcessorFormatter.remove_processors_meta, dict_tracebacks, JSONRenderer()],
)
handler = logging.StreamHandler()
handler.setFormatter(formatter)
logging.getLogger().addHandler(handler)
```

### secret-keys-masked-by-a-processor → telemetry-value-masked-by-its-key · MUST

The telemetry pipeline's mask is a processor of the chain, between `ExtraAdder` and the renderer, that walks the event's nested maps.

#### Why

A mask placed after the renderer meets text, and one outside the chain misses the records of the libraries, so a secret under a nested key reaches the output, and one before `ExtraAdder` misses every field passed in `extra`; a processor between them sees every event as a map, the foreign ones included, and the renderer writes only what it leaves.

#### Examples

```py title="Avoid"
logger.info("charge sent", extra={"card": mask_card(card), "customer_id": customer.id})
```

```py title="Prefer"
def mask_secrets(logger: WrappedLogger, method_name: str, event: EventDict) -> EventDict:
    return mask_by_key(event, secret_keys=SECRET_KEYS)


shared_processors: list[Processor] = [merge_contextvars, add_log_level, ExtraAdder(), mask_secrets]
```

### json-renderer-in-production → log-output-structured-in-production · SHOULD

Every chain run in production ends in `dict_tracebacks` and `JSONRenderer`.

#### Why

Without `dict_tracebacks` a JSON line carries its traceback as one escaped string, which a collector cannot read as fields.

#### Examples

```py title="Avoid"
renderers: list[Processor] = [format_exc_info, KeyValueRenderer()]
```

```py title="Prefer"
renderers: list[Processor] = (
    [ConsoleRenderer()]
    if settings.log_format is LogFormat.CONSOLE
    else [dict_tracebacks, JSONRenderer()]
)
```

### console-renderer-in-development → log-output-readable-in-development · SHOULD

Every chain run in development ends in `ConsoleRenderer`.

#### Why

A chain that ends in JSON in development writes objects a person reads only with a tool, while `ConsoleRenderer` writes each event as a readable line with its traceback laid out.

#### Examples

```py title="Avoid"
renderers: list[Processor] = [dict_tracebacks, JSONRenderer()]
```

```py title="Prefer"
renderers: list[Processor] = (
    [ConsoleRenderer()]
    if settings.log_format is LogFormat.CONSOLE
    else [dict_tracebacks, JSONRenderer()]
)
```

### trace-id-bound-through-contextvars → log-record-carries-the-trace-id · SHOULD

Every trace id is bound through `contextvars`. `merge_contextvars` is the chain's first processor, and the middleware of each request or task binds its trace id with `bind_contextvars`.

#### Why

A trace id passed down by hand is lost at the first library or await that does not carry it.

#### Examples

```py title="Avoid"
async def place_order(request: Request) -> Response:
    trace_id = request.headers["traceparent"]
    logger.info("placing order", extra={"trace_id": trace_id})
    return await handle_place_order(request, trace_id)
```

```py title="Prefer"
class TraceMiddleware:
    def __init__(self, app: ASGIApp) -> None:
        self._app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        clear_contextvars()
        bind_contextvars(trace_id=read_trace_id(scope))
        await self._app(scope, receive, send)
```

### request-context-cleared-on-entry → log-record-carries-the-trace-id · SHOULD

Every request's or task's middleware clears the context with `clear_contextvars` before it binds the trace id.

#### Why

A context left uncleared tags a request's records with the id of the request before.

#### Examples

```py title="Avoid"
async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
    bind_contextvars(trace_id=read_trace_id(scope))
    await self._app(scope, receive, send)
```

```py title="Prefer"
async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
    clear_contextvars()
    bind_contextvars(trace_id=read_trace_id(scope))
    await self._app(scope, receive, send)
```
