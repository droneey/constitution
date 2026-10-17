# Server with observability

> Governs what a server's signals say of its copy, and what it sends before it exits.

## Effects

### server-signals-flushed-before-exit → program-stops-cleanly · MUST

A server told to stop flushes the log records, spans and metrics it holds in buffers before it exits, within its stop bound.

| Why | Tags |
|---|---|
| the signals of the last seconds, often the ones that explain the stop, are otherwise lost with the process. | [errors] |

## Observability

### server-signal-names-its-copy → signal-carries-the-service-identity · SHOULD

Every log record and span of a server, and the resource its metrics are sent under, carry beside the service's identity the identity of the copy that sent them, as OpenTelemetry's resource conventions name it: `service.instance.id`.

| Why | Tags |
|---|---|
| a fault of one copy — its memory, its node, its release — is found only when that copy's signals can be told apart from its siblings'. | [] |
