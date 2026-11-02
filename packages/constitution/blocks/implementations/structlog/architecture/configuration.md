# Configuration

> Governs who configures structlog and its handlers.

## General

### structlog-configured-by-the-root → root-alone-configures-logging · MUST

`root/` alone configures structlog and the root logger's handler. It calls `structlog.configure` with the signal mask of `libs/` in its chain, which masks an event's nested maps, and sets the root logger's handler; no other code adds a handler or calls `logging.basicConfig`.

| Why |
|---|
| a handler added elsewhere writes records past the chain, and `logging.basicConfig` adds one. |
