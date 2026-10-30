# Logs

> Governs the chain every record passes: its logger, mask, output, trace id and fields.

## Calls

### code-logs-through-the-standard-logger → logger-got-by-module-name · MUST

Code logs through the standard logger its module gets, never through a logger of structlog's own.

| Why |
|---|
| the standard logger is the facade every library already speaks, so the program's records and theirs pass one chain. |

### fields-passed-in-extra → log-record-is-an-event-with-fields · SHOULD

A record's values are fields passed in `extra` — `logger.info('order paid', extra={'order_id': order_id})` — never `%s` arguments or an f-string in the message.

| Why |
|---|
| `extra` is how the standard logger carries a field, and `ExtraAdder` lifts it into the event; a value formatted into the message reaches the collector as text. |

## Chain

### one-chain-for-every-record → log-record-passes-one-pipeline · MUST

The pipeline is structlog's chain over the standard library: `structlog.stdlib.LoggerFactory()` makes its loggers, and one handler on the root logger formats with a `structlog.stdlib.ProcessorFormatter` whose `foreign_pre_chain` runs the same processors, `ExtraAdder` among them. No other handler writes a record.

| Why |
|---|
| `foreign_pre_chain` is what runs the processors over a record a library or the server wrote through the standard logger; without it, those records skip them. |

### secret-keys-masked-by-a-processor → signal-value-masked-by-its-key · MUST

The mask is a processor of the chain, placed before the renderer, that walks the event's nested maps.

| Why |
|---|
| a processor before the renderer sees every event as a map, the foreign ones included, and the renderer writes only what it leaves. |

### json-in-production-console-in-development → log-output-structured-in-production · SHOULD

The chain ends in `dict_tracebacks` and `JSONRenderer` in production, and in `ConsoleRenderer` in development.

| Why |
|---|
| `dict_tracebacks` turns an exception into fields, so a JSON line keeps its traceback as data a collector reads, not as one escaped string. |

### trace-id-bound-through-contextvars → log-record-carries-the-trace-id · SHOULD

`merge_contextvars` is the chain's first processor, and the middleware of each request or task clears the context with `clear_contextvars` and binds its trace id with `bind_contextvars`.

| Why |
|---|
| every record the request writes then carries its id, through every await and every library, with no logger passed down, and the cleared context carries no id of the request before. |
