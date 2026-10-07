---
id: pino
summary: pino writes the program's log records as JSON lines.
requires: [typescript, observability]
extends: null
abstract: false
languages: []
dictionary: [pino, pino-http, pino-pretty]
governs: ["**/root/**"]
---

# pino

> Writes every record — the program's and pino-http's — through one pino instance created at the program's start: secret keys masked in the finished line, the trace id added from an `AsyncLocalStorage`, JSON lines to stdout in production and pino-pretty in development. Code passes a record's fields first and its fixed message second.

### one-instance-writes-every-record → log-records-pass-one-pipeline · MUST
The pipeline is one pino instance, created at the program's start. Code logs through that instance or its children; no second instance writes a record.

| Why | Tags |
|---|---|
| the mask and the trace id are options of the instance, so a record a second instance writes carries neither. | [security] |

### secret-keys-masked-in-the-finished-line → log-secrets-masked-by-key · MUST
The mask is the instance's `hooks.streamWrite`, which parses each finished line, masks it and writes it again. `redact` is no such mask: it matches exact paths, with case, and its wildcard spans one level.

| Why | Tags |
|---|---|
| only the finished line holds every part of a record — its fields, a child's bindings and pino-http's request — while `formatters.log` sees the fields alone and leaves `req.headers.authorization` in the output. | [security] |

### json-lines-to-stdout-in-production → log-output-structured-in-production · SHOULD
In production the instance has no `transport` and writes JSON lines to stdout, its default destination; in development a setting read at the program's start adds `transport: { target: 'pino-pretty' }`.

| Why | Tags |
|---|---|
| a transport moves the writing to a worker thread that a collector reading stdout does not need, and pino-pretty's lines are for a person, not a parser. | [] |

### trace-id-added-by-mixin → log-records-carry-the-trace-id · SHOULD
The instance's `mixin` returns the trace id from an `AsyncLocalStorage` — `mixin: () => ({ traceId: traceScope.getStore()?.traceId })` — and the middleware of each request or task enters it with `traceScope.run({ traceId }, next)`, the caller's id from its header or a new one.

| Why | Tags |
|---|---|
| `mixin` runs for every record of the instance and its children, pino-http's included, so a record written after any await carries the id with no logger passed down. | [] |

### fields-first-message-second → log-record-is-an-event-with-fields · SHOULD
A record's fields are the first argument and its fixed message the second — `logger.info({ orderId }, 'order paid')` — never a message first with values after it.

| Why | Tags |
|---|---|
| pino formats the arguments after a message into it and drops an object that no placeholder takes: `logger.info('order paid', { orderId })` writes no `orderId`. | [] |
