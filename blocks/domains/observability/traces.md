# Traces

> Governs spans, the trace context, and what a span may carry.

## Context

### trace-id-taken-only-from-a-trusted-caller · SHOULD
A unit of work continues the trace id its caller sent in the W3C Trace Context only when that caller is one of the program's own systems; for any other it starts a new one.

| Why | Tags |
|---|---|
| a trace id taken from anyone lets an outsider tie their requests into the program's traces or flood one trace with records. | [security] |

### trace-context-propagated-onward · SHOULD
A call to another system carries the trace context of the work that made it, in the W3C Trace Context headers.

| Why | Tags |
|---|---|
| a trace that stops at the program's edge shows the time spent but not where it went. | [] |

## Spans

### unit-of-work-opens-a-span · SHOULD
Every unit of work — a request served, a task run, a message handled, a call to another system — runs in a span named after its operation, which records its outcome.

| Why | Tags |
|---|---|
| a trace shows where the time of a request went only if each step it took is a span of it. | [] |

## Content

### span-attribute-masked-by-its-key → secret-and-personal-data-kept-out-of-output · MUST
Span attributes, span events and metric exemplars pass the mask the logs pass, by the same list of keys, before export; an address is recorded without its query and a database statement only with placeholders for its values.

| Why | Tags |
|---|---|
| instrumentation records the full URL, the statement's text and an exception's message by default, so a mask on logs alone leaves the same secret in every trace. | [security, data] |
