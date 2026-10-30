# Configuration

> Governs who configures structlog and its handlers.

## General

### structlog-configured-by-the-root → root-alone-configures-logging · MUST

`root/` calls `structlog.configure`, sets the root logger's handler and builds the middleware that binds the trace id; no other code adds a handler or calls `logging.basicConfig`.

| Why |
|---|
| a handler added elsewhere writes records past the chain, and `logging.basicConfig` adds one. |
