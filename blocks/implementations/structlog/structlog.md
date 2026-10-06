---
id: structlog
summary: structlog renders the records of Python's logging as events.
requires: [python, observability]
extends: null
abstract: false
languages: []
dictionary: [structlog]
governs: ["**/root/**"]
---

# structlog

> Renders every record of the standard library's `logging` — the program's, its libraries' and its server's — through one chain of processors: the context of the request bound through `contextvars`, secrets masked, JSON in production and readable lines in development. Code logs through `logging.getLogger(__name__)`, and only the program's start configures structlog.

### code-logs-through-the-standard-logger → diagnostics-through-the-logging-facade
Code logs through `logging.getLogger(__name__)`, the logger every library writes to, never through a logger of structlog's own.

| Why | Tags |
|---|---|
| the standard logger is the facade every library already speaks, so the program's records and theirs pass one chain. | [] |

### one-chain-for-every-record → log-records-pass-one-pipeline
The pipeline is structlog's chain over the standard library: `structlog.stdlib.LoggerFactory()` makes its loggers, and one handler on the root logger formats with a `structlog.stdlib.ProcessorFormatter` whose `foreign_pre_chain` runs the same processors, `ExtraAdder` among them. No other handler writes a record.

| Why | Tags |
|---|---|
| `foreign_pre_chain` is what runs the processors over a record a library or the server wrote through the standard logger; without it, those records skip them. | [security] |

### secret-keys-masked-by-a-processor → log-secrets-masked-by-key
The mask is a processor of the chain, placed before the renderer, that walks the event's nested maps.

| Why | Tags |
|---|---|
| a processor before the renderer sees every event as a map, the foreign ones included, and the renderer writes only what it leaves. | [security] |

### json-in-production-console-in-development → log-output-structured-in-production
The chain ends in `dict_tracebacks` and `JSONRenderer` in production, and in `ConsoleRenderer` in development, as a setting read at the program's start chooses.

| Why | Tags |
|---|---|
| `dict_tracebacks` turns an exception into fields, so a JSON line keeps its traceback as data a collector reads, not as one escaped string. | [] |

### trace-id-bound-through-contextvars → log-records-carry-the-trace-id
`merge_contextvars` is the chain's first processor, and the middleware of each request or task clears the context with `clear_contextvars` and binds its trace id — the caller's, from its header, or a new one — with `bind_contextvars`.

| Why | Tags |
|---|---|
| every record the request writes then carries its id, through every await and every library, with no logger passed down, and the cleared context carries no id of the request before. | [] |

### fields-passed-in-extra → log-record-is-an-event-with-fields
A record's values are fields passed in `extra` — `logger.info('order paid', extra={'order_id': order_id})` — never `%s` arguments or an f-string in the message.

| Why | Tags |
|---|---|
| `extra` is how the standard logger carries a field, and `ExtraAdder` lifts it into the event; a value formatted into the message reaches the collector as text. | [] |
