# Traces

> Governs spans and the trace context.

## Vocabulary

A **trusted caller** of a work item is a system the project runs that the program's configuration lists as one.

## Context

### trace-id-taken-only-from-a-trusted-caller · MUST

Every work item continues the trace its caller sent only when that caller is a trusted caller. From any other caller it starts a new trace.

#### Why

A trace id taken from anyone lets an outsider tie their requests into the program's traces or flood one trace with records.

#### Examples

```pseudo title="Avoid"
# libs/trace-middleware/start-trace
function startTrace(request, trustedCallers)
  return continueTrace(parseTraceparent(request.headers["traceparent"]))  # anyone's trace
```

```pseudo title="Prefer"
# libs/trace-middleware/start-trace
function startTrace(request, trustedCallers)
  let sent = parseTraceparent(request.headers["traceparent"])

  if trustedCallers.includes(request.caller) then
    return continueTrace(sent)

  return newTrace({ links: sent is <absent> ? [] : [sent] })
```

### new-trace-linked-to-the-context-it-was-sent · SHOULD

Every new trace started for a caller that is no trusted caller links to the W3C Trace Context it was sent.

#### Why

A new trace with no link to the one it was sent loses the path the work took before it reached the program, so a failure that crossed both systems is traced on neither side.

#### Examples

```pseudo title="Avoid"
# libs/trace-middleware/start-trace
function startTrace(request, trustedCallers)
  let sent = parseTraceparent(request.headers["traceparent"])

  if trustedCallers.includes(request.caller) then
    return continueTrace(sent)

  return newTrace()
```

```pseudo title="Prefer"
# libs/trace-middleware/start-trace
function startTrace(request, trustedCallers)
  let sent = parseTraceparent(request.headers["traceparent"])

  if trustedCallers.includes(request.caller) then
    return continueTrace(sent)

  return newTrace({ links: sent is <absent> ? [] : [sent] })
```

### trace-context-propagated-onward · SHOULD

Every call to another system carries the trace context of the work that made it, in the W3C Trace Context.

#### Why

A trace that stops at the program's boundary shows how long the work took but not where the time went — W3C Trace Context.

#### Examples

```pseudo title="Avoid"
# libs/payment-provider-client/send
function send(request, context)
  return withClientSpan(request.operation, context, function(span)
    transport.send(request, { signal: context.signal }))  # the provider starts a trace of its own
```

```pseudo title="Prefer"
# libs/payment-provider-client/send
function send(request, context)
  return withClientSpan(request.operation, context, function(span)
    transport.send({
      ...request,
      headers: { ...request.headers, ...traceContextHeaders(span) }
    }, { signal: context.signal }))
```

## Spans

### work-item-opens-a-span · SHOULD

Every work item and every call it makes to another system runs in a span named after its operation.

#### Why

A step that runs in no span is missing from its trace, so the time it took shows as a gap nobody can place.

#### Examples

```pseudo title="Avoid"
# libs/trace-middleware/trace-work-item
function traceWorkItem(operation, handle, trustedCallers)
  return function(request, context)
    bindTraceId(startTrace(request, trustedCallers))

    return handle(request, context)  # its time shows as a gap in the trace
```

```pseudo title="Prefer"
# libs/trace-middleware/trace-work-item
function traceWorkItem(operation, handle, trustedCallers)
  return function(request, context)
    let span = tracer.startSpan(operation, { parent: startTrace(request, trustedCallers) })

    try
      let answer = await handle(request, { ...context, span })
      span.setOutcome(Succeeded)

      return answer
    catch failure
      span.setOutcome(Failed, failure.code)
      throw failure
    finally
      span.end()
```

### span-records-its-outcome · SHOULD

Every span of a work item, or of a call it makes to another system, records the outcome of its operation.

#### Why

A span with no outcome shows where the time went but not which step failed, so the trace of a failure reads as one of a success.

#### Examples

```pseudo title="Avoid"
# libs/trace-middleware/trace-work-item
function traceWorkItem(operation, handle, trustedCallers)
  return function(request, context)
    let span = tracer.startSpan(operation, { parent: startTrace(request, trustedCallers) })

    try
      return await handle(request, { ...context, span })
    finally
      span.end()  # a failure reads as a success
```

```pseudo title="Prefer"
# libs/trace-middleware/trace-work-item
function traceWorkItem(operation, handle, trustedCallers)
  return function(request, context)
    let span = tracer.startSpan(operation, { parent: startTrace(request, trustedCallers) })

    try
      let answer = await handle(request, { ...context, span })
      span.setOutcome(Succeeded)

      return answer
    catch failure
      span.setOutcome(Failed, failure.code)
      throw failure
    finally
      span.end()
```

### event-in-a-work-item-written-as-a-log · SHOULD

Every event or failure a work item records is a log record in its span's context, never a span event.

#### Why

An event written as a span's event, which OpenTelemetry is deprecating, skips the levels and the handling every log record passes, while one written as a log record passes them and stays tied to its span by the trace and span ids it carries — OpenTelemetry.

#### Examples

```pseudo title="Avoid"
# carts/presentation/bindings/commands/apply-coupon
await applyCoupon(input, context)

context.span.addEvent("coupon applied", { couponCode: input.couponCode })
```

```pseudo title="Prefer"
# carts/presentation/bindings/commands/apply-coupon
await applyCoupon(input, context)

logger.info("coupon applied", { couponCode: input.couponCode })
```
