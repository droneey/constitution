# Configuration

> Governs who configures structlog and its handlers.

## General

### structlog-configured-by-the-root → root-alone-configures-logging · MUST

Only the composition root configures structlog and the root logger's handler. It alone calls `structlog.configure` and sets that handler; no other code adds a handler or calls `logging.basicConfig`.

| Why |
|---|
| a handler added elsewhere writes records past the chain, and `logging.basicConfig` adds one. |
