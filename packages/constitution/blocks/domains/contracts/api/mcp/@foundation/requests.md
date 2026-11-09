# Requests

> Governs a tool call that outlasts its request and the state a request hands the client.

## Long work

### long-tool-call-answered-with-a-task → long-operation-answered-with-a-handle · SHOULD

Where its client supports the protocol's tasks extension, every tool call that may outlast the client's patience answers with a task.

#### Why

A client with no news from a call cuts it at its timeout, while a task lets it follow the work without holding the call open.

#### Examples

```pseudo title="Avoid"
function exportOrders(args, context)
  let file = buildOrdersExport(args.range, context)

  return toolResult({ fileUrl: file.url })
```

```pseudo title="Prefer"
function exportOrders(args, context)
  if not context.client.supportsTasks then
    return exportOrdersWithProgress(args, context)

  let task = exportTasks.start(args.range, context)

  return taskResult(task.id)
```

### long-tool-call-reports-its-progress · SHOULD

Where a request asks for progress and its client supports no task, every long tool call sends progress notifications. It sends them on its response stream, and a call is long when it may outlast the client's patience.

#### Why

A client with no news from a call it cannot follow as a task cuts it at its timeout, and progress is the one news the protocol then carries.

#### Examples

```pseudo title="Avoid"
function exportOrdersWithProgress(args, context)
  for month in args.months
    call writeMonth(month, context)

  return toolResult({ fileUrl: exportUrl(args) })
```

```pseudo title="Prefer"
function exportOrdersWithProgress(args, context)
  for (month, index) in args.months
    call writeMonth(month, context)
    if context.progressToken is not <absent> then
      call context.notify("notifications/progress", {
        progressToken: context.progressToken,
        progress: index + 1,
        total: args.months.length,
      })

  return toolResult({ fileUrl: exportUrl(args) })
```

## State

### request-state-verified-when-it-returns · MUST

Every `requestState` that steers access or a tool's behaviour is sealed by an HMAC or an AEAD, and verified when it returns.

#### Why

The state passes through the client, which may change it, so a state trusted unchecked does whatever the client wrote into it.

#### Examples

```pseudo title="Avoid"
function readRequestState(raw)
  return parseJson(base64Decode(raw))
```

```pseudo title="Prefer"
function readRequestState(raw)
  let opened = aeadOpen(requestStateKey, raw)

  if opened is <absent> then
    throw new RequestStateRefusedError()

  return parseJson(opened)
```

### request-state-bound-to-its-call · MUST

Every `requestState` that steers access or a tool's behaviour carries its caller, a short expiry and the request it belongs to. Each is checked when the state returns.

#### Why

A sealed state the client cannot change can still be replayed later or handed to another caller, and acts for whoever does.

#### Examples

```pseudo title="Avoid"
function sealRefundState(call, context)
  return aeadSeal(requestStateKey, { orderId: call.arguments.orderId })
```

```pseudo title="Prefer"
let requestStateLifetime = 5 minutes

function sealRefundState(call, context)
  return aeadSeal(requestStateKey, {
    orderId: call.arguments.orderId,
    callerId: context.actor.userId,
    toolCall: hash(call.name, call.arguments),
    expiresAt: clock.now() + requestStateLifetime,
  })

function openRefundState(raw, call, context)
  let state = aeadOpen(requestStateKey, raw)

  if state is <absent>
      or state.callerId is not context.actor.userId
      or state.toolCall is not hash(call.name, call.arguments)
      or state.expiresAt < clock.now() then
    throw new RequestStateRefusedError()

  return state
```

### single-use-request-state-consumed-on-the-server · MUST

Every `requestState` that may be used once is consumed on the server when it returns.

#### Why

A state checked only by its seal and its expiry is used again as many times as its holder sends it within its life.

#### Examples

```pseudo title="Avoid"
function openRefundApproval(raw, call, context)
  let state = openRefundState(raw, call, context)

  return state.approval
```

```pseudo title="Prefer"
function openRefundApproval(raw, call, context)
  let state = openRefundState(raw, call, context)

  if not usedRequestStates.consume(state.nonce, until: state.expiresAt) then
    throw new RequestStateRefusedError()

  return state.approval
```
