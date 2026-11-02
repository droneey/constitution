# Pipeline

> Governs where the parts of the signal pipeline live and who assembles them.

## General

### signal-mask-kept-in-libs → shared-piece-placed-by-meaning · MUST

The mask of the signal pipeline is kept in `libs/`. It is a module there that knows nothing of the product but the keys it is handed, and the composition root alone hands it to the logger and every exporter it configures.

| Why |
|---|
| a mask written into the product is proven only through the product's specs, and one each logger or exporter wires for itself spreads the logging library beyond the root. |

### trace-middleware-kept-in-libs → shared-piece-placed-by-meaning · MUST

The trace middleware is kept in `libs/`. The code that binds each unit of work's trace id at its start — a request's middleware, a consumer's wrapper — is a module there that knows nothing of the product, which the composition root registers and connects to the logger it configures.

| Why |
|---|
| a middleware written into the product proves its choice between the caller's trace id and a new one only through the product's specs, and one that reaches the logging library itself spreads that library beyond the root. |
