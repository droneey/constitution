# Logs

> Governs the chain every record passes: its logger, mask, output, trace id and fields.

## Calls

### code-logs-through-the-standard-logger → logger-got-by-module-name · MUST

Code logs through the standard logger its module gets, never through a logger of structlog's own.

| Why |
|---|
| a logger of structlog's own writes past the standard logger, the facade every library already speaks, so the program's records and the libraries' pass two chains instead of one. |

### fields-passed-in-extra → log-record-is-an-event-with-fields · SHOULD

A record's values are fields passed in `extra`, never `%s` arguments or an f-string in the message.

| Why |
|---|
| a value formatted into the message reaches the collector as text no query can filter on, while `extra` is how the standard logger carries a field, which `ExtraAdder` lifts into the event. |

## Chain

### one-chain-for-every-record → log-record-passes-one-pipeline · MUST

Every record passes one structlog chain over the standard library. `structlog.stdlib.LoggerFactory()` makes its loggers, and one handler on the root logger formats with a `structlog.stdlib.ProcessorFormatter` whose `foreign_pre_chain` runs the same processors, `ExtraAdder` among them; no other handler writes a record.

| Why |
|---|
| `foreign_pre_chain` is what runs the processors over a record a library or the server wrote through the standard logger; without it, those records skip them. |

### secret-keys-masked-by-a-processor → signal-value-masked-by-its-key · MUST

The mask is a processor of the chain, placed before the renderer, that walks the event's nested maps.

| Why |
|---|
| a mask placed after the renderer meets text, and one outside the chain misses the records of the libraries, so a secret under a nested key reaches the output; a processor before the renderer sees every event as a map, the foreign ones included, and the renderer writes only what it leaves. |

### json-in-production-console-in-development → log-output-structured-in-production · SHOULD

The chain ends in `dict_tracebacks` and `JSONRenderer` in production, and in `ConsoleRenderer` in development.

| Why |
|---|
| without `dict_tracebacks` a JSON line carries its traceback as one escaped string, which a collector cannot read as fields. |

### trace-id-bound-through-contextvars → log-record-carries-the-trace-id · SHOULD

The trace id is bound through `contextvars`. `merge_contextvars` is the chain's first processor, and the middleware of each request or task clears the context with `clear_contextvars` and binds its trace id with `bind_contextvars`.

| Why |
|---|
| a trace id passed down by hand is lost at the first library or await that does not carry it, and a context left uncleared tags a request's records with the id of the request before. |
