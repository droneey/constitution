# structlog

## logging-configured-by-the-root → one-explicit-composition-root
`root/` configures logging once, at boot — `structlog.configure` and the root logger's handler — and builds the middleware that binds the trace id; no other code configures logging, and a library adds no handler and calls no `logging.basicConfig`.

| Why | Check | Tags |
|---|---|---|
| where records go and what they carry is one choice, made where every other concrete choice is. | review | [] |

## code-logs-through-the-standard-logger → diagnostics-through-the-logging-port
Code logs through `logging.getLogger(__name__)`, the logger every library writes to; only `root/` imports structlog.

| Why | Check | Tags |
|---|---|---|
| the standard logger is the port every library already speaks, so the program's records and theirs pass one chain, and no code below the root depends on a logging library. | review | [] |
