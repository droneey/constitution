# Streams

> Governs how another system's stream reaches the application layer, where it is folded and when it is cancelled.

## General

### stream-returned-as-a-sequence-of-port-events → port-knows-no-vendor · MUST

Every remote system's stream of events reaches the application layer as an asynchronous sequence of port events in the feature's words. The events are no domain events but a union to which the adapter maps the wire's events, and the sequence completes at its end and fails at a failure.

#### Why

A stream that hands the wire's events inward changes the application layer with every change of the remote transport.

#### Examples

```pseudo title="Avoid"
# reports/application/contracts/report-stream.port
type ReportStreamPort = {
  open: function(ReportRequest, CallContext): AsyncSequence of AnalyticsWireMessage
}
```

```pseudo title="Prefer"
# reports/application/contracts/report-stream.port
type ReportStreamEvent = RowArrived | ReportFinished

type ReportStreamPort = {
  open: function(ReportRequest, CallContext): AsyncSequence of ReportStreamEvent
    fails with ReportStreamCutError, AnalyticsUnavailableError
}
```

### stream-folded-in-the-domain → business-rule-lives-in-the-domain · MUST

Every stream of events that builds an entity is folded by a pure function of the domain model. It is never folded in the remote transport, nor in a cache that holds what the stream delivers.

#### Why

A fold written into the remote transport or a cache is proven only over a network, and changes with every change of the remote transport.

#### Examples

```pseudo title="Avoid"
# reports/infrastructure/analytics/report-stream.adapter
function open(request, context) yields ReportStreamEvent
  let connection = analytics.stream("/reports", request, { signal: context.signal })
  let totalCents = 0

  try
    for await message in connection
      when message.type
        is "row" then
          totalCents = totalCents + message.data.amountCents  # folded in the adapter
          yield RowArrived(parseRow(message.data), totalCents)
        is "done" then
          yield ReportFinished()
          return

    throw new ReportStreamCutError(request.reportId)
  finally
    connection.cancel()
```

```pseudo title="Prefer"
# reports/domain/report/transitions/report.transitions
function addRow(report, row)
  return { ...report, rows: [...report.rows, row], totalCents: report.totalCents + row.amountCents }

# reports/application/use-cases/queries/build-report.use-case
function createBuildReport({ reportStream })
  return function(input, context)
    let report = emptyReport(input.reportId)

    for await event in reportStream.open(input.request, context)
      if event is RowArrived then
        report = addRow(report, event.row)

    return report
```

### stream-cancelled-when-its-caller-stops-reading → outside-call-can-be-cancelled · MUST

Every sequence of port events is cancelled, with the call that feeds it, once its caller stops reading it.

#### Why

A stream its caller cannot cancel by no longer reading runs on for nobody, holding its connection and spending the other side's quota.

#### Examples

```pseudo title="Avoid"
# reports/infrastructure/analytics/report-stream.adapter
function open(request, context) yields ReportStreamEvent
  for await message in analytics.stream("/reports", request)  # runs on after its reader leaves
    when message.type
      is "row" then yield RowArrived(parseRow(message.data))
      is "done" then
        yield ReportFinished()
        return

  throw new ReportStreamCutError(request.reportId)
```

```pseudo title="Prefer"
# reports/infrastructure/analytics/report-stream.adapter
function open(request, context) yields ReportStreamEvent
  let connection = analytics.stream("/reports", request, { signal: context.signal })

  try
    for await message in connection
      when message.type
        is "row" then yield RowArrived(parseRow(message.data))
        is "done" then
          yield ReportFinished()
          return

    throw new ReportStreamCutError(request.reportId)
  finally
    connection.cancel()
```
