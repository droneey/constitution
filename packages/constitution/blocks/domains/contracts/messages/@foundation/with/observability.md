# Observability

> Governs the trace a message carries, the span of its handling, and the lag of a message consumer and the objective its alerts follow.

## Traces

### message-carries-its-creators-trace-context → trace-context-propagated-onward · SHOULD

Every message carries the trace context of the work that created it, never that of the step that publishes it. It travels in the message's headers or metadata, and beside the message wherever a store holds it before it is published.

| Why |
|---|
| a trace that stops at the message broker shows the publish and the handling as two unrelated stories, and a publishing step's own context ties every message to a timer — W3C Trace Context. |

### message-handling-span-linked-to-its-creator → work-item-opens-a-span · SHOULD

Every handling of a message runs in a span of the consumer kind, linked to the trace context the message carries.

| Why |
|---|
| a handling with no link shows as a trace of its own, cut off from the publish that caused it across the time the message waited — OpenTelemetry's messaging conventions. |

## Measures

### consumer-measured-by-its-lag · SHOULD

Every message consumer is measured by its lag: the age of its oldest waiting message and the count of those waiting.

| Why |
|---|
| a queue hides an outage behind a growing backlog, and without its lag nobody can tell a slow message consumer from an idle one when the objective starts to burn. |

### stalled-message-work-alerted → alert-fires-on-what-users-feel · SHOULD

Every stall of message work counts against the objective its alerts watch. The time from a message's arrival to its effect has an objective, against which a message moved to its dead letters counts as failed.

| Why |
|---|
| a dead letter is work the program gave up on, and users feel it only as an effect that comes late or never, which is what the objective measures. |
