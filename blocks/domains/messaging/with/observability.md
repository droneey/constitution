# Messaging with observability

> Governs the trace a message carries, the span of its handling, the lag of a consumer and the alert of a dead letter.

## Context

### message-carries-its-creators-trace-context → trace-context-propagated-onward · SHOULD
A message carries the W3C Trace Context of the work that created it in its headers, stored beside it in an outbox, so its handling continues that trace and not the relay's.

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

### consumer-lag-measured-and-alerted → served-request-measured-by-rate-errors-and-duration · SHOULD
Every consumer is measured by its lag — the age of its oldest waiting message and their count — and alerts when the lag passes a bound the project sets.

| Why | Tags |
|---|---|
| a queue hides an outage behind a growing backlog, and its oldest message's age shows the delay a user feels before any failure is logged. | [performance] |

### dead-letter-arrival-alerted · SHOULD
A message arriving in dead letters alerts the people who operate the program, with its type and the code of its failure.

| Why | Tags |
|---|---|
| a dead letter is work the program gave up on, and one nobody is told of is lost as surely as a message never sent. | [errors] |
