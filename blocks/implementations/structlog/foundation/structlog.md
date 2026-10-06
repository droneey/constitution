# structlog

## code-logs-through-the-standard-logger → diagnostics-through-the-logging-facade
Code logs through `logging.getLogger(__name__)`, the logger every library writes to, never through a logger of structlog's own.

| Why | Check | Tags |
|---|---|---|
| the standard logger is the facade every library already speaks, so the program's records and theirs pass one chain. | review | [] |

## one-chain-for-every-record → log-records-pass-one-pipeline
The pipeline is structlog's chain over the standard library: `structlog.stdlib.LoggerFactory()` makes its loggers, and one handler on the root logger formats with a `structlog.stdlib.ProcessorFormatter` whose `foreign_pre_chain` runs the same processors, `ExtraAdder` among them. No other handler writes a record.

| Why | Check | Tags |
|---|---|---|
| `foreign_pre_chain` is what runs the processors over a record a library or the server wrote through the standard logger; without it, those records skip them. | review | [security] |

## secret-keys-masked-by-a-processor → log-secrets-masked-by-key
The mask is a processor of the chain, placed before the renderer, that walks the event's nested maps.

| Why | Check | Tags |
|---|---|---|
| a processor before the renderer sees every event as a map, the foreign ones included, and the renderer writes only what it leaves. | review | [security] |

## json-in-production-console-in-development → log-output-structured-in-production
The chain ends in `dict_tracebacks` and `JSONRenderer` in production, and in `ConsoleRenderer` in development, as a setting read at the program's start chooses.

| Why | Check | Tags |
|---|---|---|
| `dict_tracebacks` turns an exception into fields, so a JSON line keeps its traceback as data a collector reads, not as one escaped string. | review | [] |

## trace-id-bound-through-contextvars → log-records-carry-the-trace-id
`merge_contextvars` is the chain's first processor, and the middleware of each request or task clears the context with `clear_contextvars` and binds its trace id — the caller's, from its header, or a new one — with `bind_contextvars`.

| Why | Check | Tags |
|---|---|---|
| every record the request writes then carries its id, through every await and every library, with no logger passed down, and the cleared context carries no id of the request before. | review | [] |

## fields-passed-in-extra → log-record-is-an-event-with-fields
A record's values are fields passed in `extra` — `logger.info('order paid', extra={'order_id': order_id})` — never `%s` arguments or an f-string in the message.

| Why | Check | Tags |
|---|---|---|
| `extra` is how the standard logger carries a field, and `ExtraAdder` lifts it into the event; a value formatted into the message reaches the collector as text. | review | [] |
