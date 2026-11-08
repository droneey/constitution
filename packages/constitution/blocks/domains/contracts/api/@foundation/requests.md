# Requests

> Governs how a request is followed, cancelled and kept apart from long work.

## Vocabulary

A **call handle** is a value that names one operation or task, which its caller follows or cancels after the request that started it.

## Handles

### call-handle-unguessable → guarding-token-from-a-cryptographic-random-source · MUST

Every call handle comes from a cryptographic random source.

#### Why

A handle that can be guessed lets anyone follow, or act on, the work of the caller who got it.

#### Examples

```pseudo title="Avoid"
function newExportHandle()
  return "exp_" + exportSequence.next()
```

```pseudo title="Prefer"
function newExportHandle()
  return "exp_" + base32(cryptoRandomBytes(16))
```

### call-handle-never-a-credential · MUST

No call handle ever authenticates its caller by itself.

#### Why

A handle that stands in for a credential lets whoever holds it, from a log or a shared link, act as the caller who got it.

#### Examples

```pseudo title="Avoid"
function downloadExport(request, context)
  let export = exports.find(request.handle, context)

  return export.file
```

```pseudo title="Prefer"
function downloadExport(request, context)
  let export = exports.find(request.handle, context)

  if export is <absent> or export.ownerId is not context.actor.userId then
    throw new ExportNotFoundError(request.handle)

  return export.file
```

### expired-handle-answered-as-expired → expected-failure-carries-a-stable-code · MUST

Every call handle that is expired or unknown is answered as an expected failure that says so.

#### Why

A caller recovers from an expired handle only if the answer says it expired.

#### Examples

```pseudo title="Avoid"
function exportState(request, context)
  let export = exports.findOwned(request.handle, context.actor.userId, context)

  return { state: export.state, file: export.file }
```

```pseudo title="Prefer"
function exportState(request, context)
  let export = exports.findOwned(request.handle, context.actor.userId, context)

  when export
    is <absent> then throw new ExportHandleUnknownError(request.handle)
    is ExpiredExport then throw new ExportHandleExpiredError(request.handle)
    is CurrentExport then return { state: export.state, file: export.file }
```

## Cancellation

### abandoned-request-stops-its-work · SHOULD

Every request its caller cancels or abandons stops its work and the calls it made, and sends nothing more. A caller cancels or abandons it by a cancel message or a closed connection.

#### Why

Work for a caller who left spends capacity and the quota of the systems it calls.

#### Examples

```pseudo title="Avoid"
function streamYearReport(request, output, context)
  for month in request.months
    let rows = reports.monthRows(month)
    call output.write(rows)
```

```pseudo title="Prefer"
function streamYearReport(request, output, context)
  for month in request.months
    if context.signal.aborted then
      return

    let rows = reports.monthRows(month, context)
    call output.write(rows)
```

## Long work

### long-operation-answered-with-a-handle · SHOULD

Every operation that may outlast a request answers at once with a call handle, never holding the request open until it ends. Its caller follows the handle for the operation's state and its result. Exempt: a call whose protocol or caller can follow no handle.

#### Why

A request held open for long work is cut by a proxy or a timeout, and its caller can neither learn the outcome nor retry safely.

#### Examples

```pseudo title="Avoid"
function exportOrders(request, context)
  let file = buildOrdersExport(request.range, context)

  return { file }
```

```pseudo title="Prefer"
function exportOrders(request, context)
  let handle = newExportHandle()

  call exportJobs.enqueue({
    handle,
    range: request.range,
    ownerId: context.actor.userId,
  }, context)
  return { handle, state: "running" }
```
