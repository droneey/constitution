# Traces

> Governs spans and the trace context.

## Vocabulary

A **trusted caller** of a work item is a system the project runs that the program's configuration lists as one.

## Context

### trace-id-taken-only-from-a-trusted-caller · MUST

Every work item continues the trace its caller sent only when that caller is a trusted caller. From any other caller it starts a new trace.

| Why |
|---|
| a trace id taken from anyone lets an outsider tie their requests into the program's traces or flood one trace with records. |

### new-trace-linked-to-the-context-it-was-sent · SHOULD

Every new trace started for a caller that is no trusted caller links to the W3C Trace Context it was sent.

| Why |
|---|
| a new trace with no link to the one it was sent loses the path the work took before it reached the program, so a failure that crossed both systems is traced on neither side. |

### trace-context-propagated-onward · SHOULD

Every call to another system carries the trace context of the work that made it, in the W3C Trace Context.

| Why |
|---|
| a trace that stops at the program's boundary shows how long the work took but not where the time went — W3C Trace Context. |

## Spans

### work-item-opens-a-span · SHOULD

Every work item and every call it makes to another system runs in a span named after its operation.

| Why |
|---|
| a step that runs in no span is missing from its trace, so the time it took shows as a gap nobody can place. |

### span-records-its-outcome · SHOULD

Every span of a work item, or of a call it makes to another system, records the outcome of its operation.

| Why |
|---|
| a span with no outcome shows where the time went but not which step failed, so the trace of a failure reads as one of a success. |

### event-in-a-work-item-written-as-a-log · SHOULD

Every event or failure a work item records is a log record in its span's context, never a span event.

| Why |
|---|
| an event written as a span's event, which OpenTelemetry is deprecating, skips the levels and the handling every log record passes, while one written as a log record passes them and stays tied to its span by the trace and span ids it carries — OpenTelemetry. |
