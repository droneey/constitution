# structlog

## one-chain-for-every-record → no-secret-or-personal-data-in-output
structlog is configured over the standard library: `structlog.stdlib.LoggerFactory()` makes its loggers, and one handler on the root logger formats with a `structlog.stdlib.ProcessorFormatter` whose `foreign_pre_chain` runs the same processors, `ExtraAdder` among them, so a record of the program, of a library or of the server is enriched, masked and rendered alike. No other handler writes a record.

| Why | Check | Tags |
|---|---|---|
| a record that bypasses the chain skips the masking and the trace id, and lands in a second format nobody parses. | review | [security] |

## secret-keys-masked-by-a-processor → no-secret-or-personal-data-in-output
A processor of the chain, before the renderer, replaces the value of every key the project lists as secret — `password`, `token`, `authorization`, `cookie`, `secret` — compared without case and in nested maps.

| Why | Check | Tags |
|---|---|---|
| a secret passed as a field by mistake is masked before it reaches any output, whichever logger wrote it. | review | [security] |

## json-in-production-console-in-development · SHOULD
The chain ends in `dict_tracebacks` and `JSONRenderer` in production, and in `ConsoleRenderer` in development, as a setting read at the program's start chooses.

| Why | Check | Tags |
|---|---|---|
| a collector parses one object per line and a person reads aligned lines; a setting, not a guess from the terminal, says which one a run writes. | review | [] |

## trace-id-bound-through-contextvars · SHOULD
`merge_contextvars` is the chain's first processor, and the middleware of each request or task clears the context with `clear_contextvars` and binds its trace id — the caller's, from its header, or a new one — with `bind_contextvars`.

| Why | Check | Tags |
|---|---|---|
| every record the request writes then carries its id, through every await and every library, with no logger passed down. | review | [] |

## record-is-an-event-with-fields · SHOULD
A record's message is a fixed phrase that names what happened, and its values are fields passed in `extra`; nothing is formatted into the message.

| Why | Check | Tags |
|---|---|---|
| a fixed message is counted and searched as one event and a field is filtered by its value, while a formatted message is a new string every time. | review | [] |
