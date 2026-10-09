# HTTP server with privacy

> Governs how a server reads a person's opt-out signal.

## Signals

### opt-out-signal-read-from-the-request → opt-out-signal-honoured · MUST
The opt-out signal is read from the `Sec-GPC` header of every request that carries it.

| Why | Tags |
|---|---|
| the header reaches every server the person's browser calls, an API with no page of its own included. | [data] |
