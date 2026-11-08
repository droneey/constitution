# Logs

> Governs the chain every record passes: its fields, mask, output and trace id.

## Calls

### fields-passed-in-extra → log-record-is-an-event-with-fields · SHOULD

Every value of a record is a field passed in `extra`, never a `%s` argument or an f-string in the message.

| Why |
|---|
| a value formatted into the message reaches the collector as text no query can filter on, while `extra` is how the standard logger carries a field, which `ExtraAdder` lifts into the event. |

### extra-field-named-apart-from-record-attributes → log-record-is-an-event-with-fields · MUST

Every field passed in `extra` takes a name no `LogRecord` attribute holds, such as `name`, `message` or `args`.

| Why |
|---|
| `logging` raises `KeyError` at the call for a field named like a `LogRecord` attribute, so the code that logs fails with it. |

## Chain

### one-chain-for-every-record → log-record-passes-one-pipeline · MUST

Every record passes one structlog chain over the standard library. The one handler on the root logger formats with a `structlog.stdlib.ProcessorFormatter` whose `foreign_pre_chain` runs the same processors, `ExtraAdder` among them.

| Why |
|---|
| `foreign_pre_chain` is what runs the processors over a record a library or the server wrote through the standard logger; without it, those records skip them. |

### secret-keys-masked-by-a-processor → telemetry-value-masked-by-its-key · MUST

The telemetry pipeline's mask is a processor of the chain, between `ExtraAdder` and the renderer, that walks the event's nested maps.

| Why |
|---|
| a mask placed after the renderer meets text, and one outside the chain misses the records of the libraries, so a secret under a nested key reaches the output, and one before `ExtraAdder` misses every field passed in `extra`; a processor between them sees every event as a map, the foreign ones included, and the renderer writes only what it leaves. |

### json-renderer-in-production → log-output-structured-in-production · SHOULD

Every chain run in production ends in `dict_tracebacks` and `JSONRenderer`.

| Why |
|---|
| without `dict_tracebacks` a JSON line carries its traceback as one escaped string, which a collector cannot read as fields. |

### console-renderer-in-development → log-output-readable-in-development · SHOULD

Every chain run in development ends in `ConsoleRenderer`.

| Why |
|---|
| a chain that ends in JSON in development writes objects a person reads only with a tool, while `ConsoleRenderer` writes each event as a readable line with its traceback laid out. |

### trace-id-bound-through-contextvars → log-record-carries-the-trace-id · SHOULD

Every trace id is bound through `contextvars`. `merge_contextvars` is the chain's first processor, and the middleware of each request or task binds its trace id with `bind_contextvars`.

| Why |
|---|
| a trace id passed down by hand is lost at the first library or await that does not carry it. |

### request-context-cleared-on-entry → log-record-carries-the-trace-id · SHOULD

Every request's or task's middleware clears the context with `clear_contextvars` before it binds the trace id.

| Why |
|---|
| a context left uncleared tags a request's records with the id of the request before. |
