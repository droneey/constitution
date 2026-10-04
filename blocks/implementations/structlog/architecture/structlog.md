# structlog

## structlog-configured-by-the-root → logging-configured-by-the-root
`root/` calls `structlog.configure`, sets the root logger's handler and builds the middleware that binds the trace id; no other code adds a handler or calls `logging.basicConfig`.

| Why | Check | Tags |
|---|---|---|
| a handler added elsewhere writes records past the chain, and `logging.basicConfig` adds one. | review | [] |

## code-logs-through-the-standard-logger → diagnostics-through-the-logging-port
Code logs through `logging.getLogger(__name__)`, the logger every library writes to; only `root/` imports structlog.

| Why | Check | Tags |
|---|---|---|
| the standard logger is the port every library already speaks, so the program's records and theirs pass one chain, and no code below the root depends on a logging library. | review | [] |
