# Logs

> Governs the instance that writes every record: its mask, trace id, output and arguments.

## General

### one-instance-writes-every-record → log-record-passes-one-pipeline · MUST

One pino instance writes every record. It is created at the program's start, code logs through it or its children, and no second instance writes a record.

| Why |
|---|
| the mask and the trace id are options of the instance, so a record a second instance writes carries neither: it leaks what the mask hides and joins no trace. |

### secret-keys-masked-in-the-finished-line → signal-value-masked-by-its-key · MUST

Secrets are masked in the finished line, by the instance's `hooks.streamWrite`. That hook parses each finished line, masks it and writes it again; `redact` is no such mask, as it matches exact paths, with case, and its wildcard spans one level.

| Why |
|---|
| only the finished line holds every part of a record (its fields, a child's bindings and pino-http's request) so a mask in `formatters.log`, which sees the fields alone, leaves `req.headers.authorization` in the output. |

### json-lines-to-stdout-in-production → log-output-structured-in-production · SHOULD

In production the instance writes JSON lines to stdout, with no `transport`. Stdout is its default destination; in development it takes `transport: { target: 'pino-pretty' }`.

| Why |
|---|
| a transport in production moves the writing to a worker thread that a collector reading stdout does not need, and pino-pretty's lines there are text the collector cannot parse. |

### trace-id-added-by-mixin → log-record-carries-the-trace-id · SHOULD

The instance's `mixin` adds the trace id to every record. It returns the id from an `AsyncLocalStorage`, and the middleware of each request or task enters the id into that storage with its `run` before the work goes on.

| Why |
|---|
| a trace id passed down by hand is missing from every record written where nobody passed it, while `mixin` runs for every record of the instance and its children, pino-http's included, so a record written after any await carries the id. |

### fields-first-message-second → log-record-is-an-event-with-fields · SHOULD

A record's fields come first and its fixed message second. The fields object is the first argument and the message the second, never a message first with values after it.

| Why |
|---|
| pino formats the arguments after a message into it and drops an object that no placeholder takes, so a record written message first loses its fields without a warning. |
