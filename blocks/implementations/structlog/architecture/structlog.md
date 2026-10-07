# structlog

### structlog-configured-by-the-root → logging-configured-by-the-root · MUST
`root/` calls `structlog.configure`, sets the root logger's handler and builds the middleware that binds the trace id; no other code adds a handler or calls `logging.basicConfig`.

| Why | Tags |
|---|---|
| a handler added elsewhere writes records past the chain, and `logging.basicConfig` adds one. | [] |

### only-the-root-imports-structlog → root-alone-configures-logging · MUST
structlog's home is `root/`: no other folder imports it.

| Why | Tags |
|---|---|
| no code below the root then depends on a logging library. | [] |
