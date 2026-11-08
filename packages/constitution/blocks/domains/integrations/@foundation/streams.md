# Streams

> Governs a stream of events from another system.

## Ends

### stream-cut-before-its-terminal-event-fails → failure-is-expected-or-defect · MUST

Every stream that ends without its terminal event fails with an expected failure of its own type, never ending as complete.

#### Why

A stream broken off otherwise looks like a complete one, and the user takes a partial result for the final one.

#### Examples

```pseudo title="Avoid"
# reports/infrastructure/analytics/report-stream.adapter
function open(request, context) yields ReportStreamEvent
  let connection = analytics.stream("/reports", request, { signal: context.signal })

  try
    for await message in connection
      when message.type
        is "row" then yield RowArrived(parseRow(message.data))
        is "done" then yield ReportFinished()
  finally
    connection.cancel()
  # a cut connection ends here as if complete
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
