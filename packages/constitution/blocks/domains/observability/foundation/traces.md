# Traces

> Governs spans and the trace context.

## Context

### trace-id-taken-only-from-a-trusted-caller · SHOULD

A unit of work continues the trace id its caller sent in the W3C Trace Context only when that caller is one of the program's own systems; for any other it starts a new one, linked to the context it was sent.

| Why |
|---|
| a trace id taken from anyone lets an outsider tie their requests into the program's traces or flood one trace with records. |

### trace-context-propagated-onward · SHOULD

A call to another system carries the trace context of the work that made it, in the W3C Trace Context headers.

| Why |
|---|
| a trace that stops at the program's edge shows the time spent but not where it went. |

## Spans

### unit-of-work-opens-a-span · SHOULD

Every unit of work — a request served, a task run, a message handled, a call to another system — runs in a span named after its operation, which records its outcome.

| Why |
|---|
| a trace shows where the time of a request went only if each step it took is a span of it. |

### event-in-a-unit-of-work-written-as-a-log · SHOULD

An event or a failure inside a unit of work is written as a log record in its span's context, never through the span-event API.

| Why |
|---|
| OpenTelemetry has deprecated span events, since an event is a log with a name: one written as a log passes the log pipe, its mask and its levels, and stays tied to its span by the trace and span ids it carries. |
