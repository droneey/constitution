# Messaging with observability

> Governs the trace a message carries, the span of its handling, the lag of a consumer, and the alerts of a dead letter and of a scheduled run that fails or never runs.

## Context

### message-carries-its-creators-trace-context → trace-context-propagated-onward · SHOULD
A message carries the W3C Trace Context of the work that created it in its headers, stored beside it in an outbox, so its handling's span links to that trace, not the relay's.

| Why | Tags |
|---|---|
| a trace that stops at the broker shows the publish and the handling as two unrelated stories, and a relay's own context ties every message to a timer. | [] |

## Spans

### handled-message-spanned-and-linked → unit-of-work-opens-a-span · SHOULD
Handling a message runs in a consumer span named after its operation and destination, linked to the context the message carries, with the attributes OpenTelemetry's messaging conventions name — the system, the destination and the message's identifier.

| Why | Tags |
|---|---|
| a link joins a handling to its publish across the time a message waits, and the conventional names let any backend group spans by queue. | [] |

## Measures

### backlog-dead-letters-and-missed-runs-alerted · SHOULD
Every consumer is measured by its lag — the age of its oldest waiting message and their count; lag past a bound the project sets, a message arriving in dead letters, and a scheduled run that fails or never runs each alert the operators.

| Why | Tags |
|---|---|
| a queue hides an outage behind a growing backlog, a dead letter is work the program gave up on, and a job that stops running fails in silence — each noticed only when its work is missed, unless someone is told. | [errors, performance] |
