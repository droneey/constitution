# Observability

> Governs the trace a message carries, the span of its handling, and the lag of a consumer and the objective its alerts follow.

## Traces

### message-carries-its-creators-trace-context → trace-context-propagated-onward · SHOULD

A message carries its creator's trace context. It carries the W3C Trace Context of the work that created it in its headers or metadata — stored beside it in the outbox, where it travels through one — so its handling's span links to that trace, not the relay's.

| Why |
|---|
| a trace that stops at the broker shows the publish and the handling as two unrelated stories, and a relay's own context ties every message to a timer — W3C Trace Context. |

### handled-message-spanned-and-linked → unit-of-work-opens-a-span · SHOULD

Handling a message runs in a consumer span linked to the context the message carries. The span is named after its operation and destination and carries the attributes OpenTelemetry's messaging conventions name — the system, the destination and the message's identifier.

| Why |
|---|
| a handling with no link shows as a trace of its own, cut off from the publish that caused it across the time the message waited, and spans named each their own way cannot be grouped by queue in any backend — OpenTelemetry's messaging conventions. |

## Measures

### stalled-message-work-alerted → alert-fires-on-what-users-feel · SHOULD

Stalled message work is alerted on as its objective's error budget burns. Every consumer is measured by its lag — the age of its oldest waiting message and their count — and the time from a message's arrival to its effect has an objective, against which a message moved to dead letters and a scheduled run that fails or never runs each count as failed; the operators are alerted as that objective's error budget burns, never on lag past a fixed bound.

| Why |
|---|
| a queue hides an outage behind a growing backlog, a dead letter is work the program gave up on and a job that stops running fails in silence; users feel each only as an effect that comes late or never, which is what the objective measures. |
