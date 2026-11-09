# Observability

> Governs the trace a message carries, the span of its handling, and the lag of a message consumer and the objective its alerts follow.

## Traces

### message-carries-its-creators-trace-context → trace-context-propagated-onward · SHOULD

Every message carries the trace context of the work that created it, never that of the step that publishes it. It travels in the message's headers or metadata, and beside the message wherever a store holds it before it is published.

#### Why

A trace that stops at the message broker shows the publish and the handling as two unrelated stories, and a publishing step's own context ties every message to a timer — W3C Trace Context.

#### Examples

```pseudo title="Avoid"
function relay(entry, context)
  call publishConfirmed(entry.message, {
    headers: { traceparent: currentTraceparent() },
  }, context)
```

```pseudo title="Prefer"
function placeOrder(order, transaction)
  call orders.save(order, transaction)
  call outbox.add({
    message: orderPlaced(order),
    traceparent: currentTraceparent(),
  }, transaction)

function relay(entry, context)
  call publishConfirmed(entry.message, {
    headers: { traceparent: entry.traceparent },
  }, context)
```

### message-handling-span-linked-to-its-creator → work-item-opens-a-span · SHOULD

Every handling of a message runs in a span of the consumer kind, linked to the trace context the message carries.

#### Why

A handling with no link shows as a trace of its own, cut off from the publish that caused it across the time the message waited — OpenTelemetry's messaging conventions.

#### Examples

```pseudo title="Avoid"
function receive(message, context)
  let span = tracer.startSpan("process orders.order-paid")
  ...
```

```pseudo title="Prefer"
function receive(message, context)
  let span = tracer.startSpan("process orders.order-paid", {
    kind: Consumer,
    links: [extractTraceContext(message.headers)],
  })
  ...
```

## Measures

### consumer-measured-by-its-lag · SHOULD

Every message consumer is measured by its lag: the age of its oldest waiting message and the count of those waiting.

#### Why

A queue hides an outage behind a growing backlog, and without its lag nobody can tell a slow message consumer from an idle one when the objective starts to burn.

#### Examples

```pseudo title="Avoid"
call metrics.count("loyalty_points.messages_handled")
```

```pseudo title="Prefer"
call metrics.count("loyalty_points.messages_handled")

every 30 seconds
  call metrics.gauge("loyalty_points.oldest_waiting_seconds", queue.oldestAge())
  call metrics.gauge("loyalty_points.waiting_messages", queue.waitingCount())
```

### stalled-message-work-alerted → alert-fires-on-what-users-feel · SHOULD

Every stall of message work counts against the objective its alerts watch. The time from a message's arrival to its effect has an objective, against which a message moved to its dead letters counts as failed.

#### Why

A dead letter is work the program gave up on, and users feel it only as an effect that comes late or never, which is what the objective measures.

#### Examples

```text title="Avoid"
alert      loyalty-points consumer errors above 10 a minute
```

```text title="Prefer"
objective  loyalty points added within 5 minutes of order-paid
target     99.5% over 28 days
failed     took longer than 5 minutes, or dead-lettered
alert      error budget burning 14.4 times too fast for 1 hour
```
