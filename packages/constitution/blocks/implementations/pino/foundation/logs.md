# Logs

> Governs the instance that writes every record: its mask, trace id, output and arguments.

## General

### one-instance-writes-every-record → log-record-passes-one-pipeline · MUST

The pipeline is one pino instance, created at the program's start. Code logs through that instance or its children; no second instance writes a record.

| Why |
|---|
| the mask and the trace id are options of the instance, so a record a second instance writes carries neither. |

### secret-keys-masked-in-the-finished-line → signal-value-masked-by-its-key · MUST

The mask is the instance's `hooks.streamWrite`, which parses each finished line, masks it and writes it again. `redact` is no such mask: it matches exact paths, with case, and its wildcard spans one level.

| Why |
|---|
| only the finished line holds every part of a record — its fields, a child's bindings and pino-http's request — while `formatters.log` sees the fields alone and leaves `req.headers.authorization` in the output. |

### json-lines-to-stdout-in-production → log-output-structured-in-production · SHOULD

In production the instance has no `transport` and writes JSON lines to stdout, its default destination; in development it takes `transport: { target: 'pino-pretty' }`.

| Why |
|---|
| a transport moves the writing to a worker thread that a collector reading stdout does not need, and pino-pretty's lines are for a person, not a parser. |

### trace-id-added-by-mixin → log-record-carries-the-trace-id · SHOULD

The instance's `mixin` returns the trace id from an `AsyncLocalStorage` — `mixin: () => ({ traceId: traceScope.getStore()?.traceId })` — and the middleware of each request or task enters it with `traceScope.run({ traceId }, next)`.

| Why |
|---|
| `mixin` runs for every record of the instance and its children, pino-http's included, so a record written after any await carries the id with no logger passed down. |

### fields-first-message-second → log-record-is-an-event-with-fields · SHOULD

A record's fields are the first argument and its fixed message the second — `logger.info({ orderId }, 'order paid')` — never a message first with values after it.

| Why |
|---|
| pino formats the arguments after a message into it and drops an object that no placeholder takes: `logger.info('order paid', { orderId })` writes no `orderId`. |
