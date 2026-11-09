# Limits

> Governs the most a request may ask and an answer may hold.

## Size

### request-bounded-in-what-it-asks · MUST

Every request is bounded in what it asks, and one past a bound is refused before it runs. The bounds cover the items of a batch and the cost of a nested query.

#### Why

A request with no bound on what it asks lets one caller exhaust the memory, the disk or the time every caller shares, though its size passed every check.

#### Examples

```pseudo title="Avoid"
function cancelOrders(request, context)
  for orderId in request.orderIds
    call cancelOrder({ orderId }, context)
```

```pseudo title="Prefer"
let maxOrdersPerBatch = 100

function cancelOrders(request, context)
  if request.orderIds.length > maxOrdersPerBatch then
    throw new BatchTooLargeError(maxOrdersPerBatch)

  for orderId in request.orderIds
    call cancelOrder({ orderId }, context)
```

### answer-bounded-in-size · MUST

Every answer is bounded in size by a maximum the server holds.

#### Why

An unbounded answer exhausts the caller that reads it and the server that builds it.

#### Examples

```pseudo title="Avoid"
function sendAnswer(answer, output)
  call output.write(serialize(answer))
```

```pseudo title="Prefer"
let maxAnswerBytes = 5 MB

function sendAnswer(answer, output)
  let body = new BoundedBuffer(maxAnswerBytes, function()
    return new AnswerTooLargeError(maxAnswerBytes))

  call serializeInto(answer, body)
  call output.write(body)
```

### cut-answer-says-it-was-cut · MUST

Every answer cut to its maximum size says so. It either says how to narrow the request or carries the cursor of the rest.

#### Why

A silent cut makes its caller believe it saw everything.

#### Examples

```text title="Avoid"
{
  "invoiceId": "inv-7",
  "lines": [ ...the first 1000 lines ]
}
```

```text title="Prefer"
{
  "invoiceId": "inv-7",
  "lines": [ ...the first 1000 lines ],
  "cut": true,
  "nextCursor": "c2VxOjEwMDA"
}
```

## Rate

### caller-rate-limited · MUST

Every caller's requests are limited by rate, per caller, and a request over the limit is refused as rate-limited.

#### Why

One caller, a runaway script or an attacker, otherwise takes the capacity every other caller needs.

#### Examples

```pseudo title="Avoid"
let requestRate = 10000 per minute

function admit(request, context)
  if not rateLimiter.take("all-callers", requestRate) then
    throw new RateLimitedError(rateLimiter.retryAfter("all-callers"))
```

```pseudo title="Prefer"
let callerRate = 100 per minute

function admit(request, context)
  let caller = context.actor.clientId

  if not rateLimiter.take(caller, callerRate) then
    throw new RateLimitedError(rateLimiter.retryAfter(caller))
```

### costly-operation-limited-tighter · SHOULD

Every costly operation has a rate limit tighter than its caller's general one.

#### Why

A limit set for cheap requests lets a caller spend, on a costly one, many times the capacity the limit meant to give it.

#### Examples

```pseudo title="Avoid"
let callerRate = 100 per minute

let operationRates = {
  listOrders: callerRate,
  exportOrders: callerRate,
}
```

```pseudo title="Prefer"
let callerRate = 100 per minute
let exportRate = 5 per hour

let operationRates = {
  listOrders: callerRate,
  exportOrders: exportRate,
}
```

### rate-refusal-says-when-to-retry · SHOULD

Every request refused for its rate says when to retry.

#### Why

A caller not told when to come back retries at once, into the load that refused it.

#### Examples

```text title="Avoid"
{
  "code": "request.rate-limited",
  "occurrenceId": "occ_2a8d5f1b93"
}
```

```text title="Prefer"
{
  "code": "request.rate-limited",
  "details": { "retryAfterSeconds": 30 },
  "occurrenceId": "occ_2a8d5f1b93"
}
```
