# Traces

> Governs the trace context of a unit of work.

## Context

### log-record-carries-the-trace-id · SHOULD
Every log record a unit of work — a request, a task, a message — writes carries its trace id, bound once at the unit's start through the runtime's context, never passed down by hand.

| Why | Tags |
|---|---|
| the records of one unit are then found together, across every function and library it passes through, while an id passed by hand is lost at the first call that does not take it. | [] |

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
