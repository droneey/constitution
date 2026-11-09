# Failures

> Governs how a failure is answered and how it is raised.

## Answers

### failure-answered-by-its-code → expected-failure-carries-a-stable-code · MUST

Every expected failure of a request is answered with the answer its code maps to, carrying its code and its details.

#### Why

A caller with no stable code to branch on parses messages that break when they are reworded.

#### Examples

```pseudo title="Avoid"
function answerFailure(error, context)
  if isExpectedFailure(error) then
    return failureAnswer({
      message: error.message,
      occurrenceId: context.occurrenceId,
    })

  return internalError({ occurrenceId: reportDefect(error) })
```

```pseudo title="Prefer"
function answerFailure(error, context)
  if isExpectedFailure(error) then
    return failureAnswer(answerKindOf(error.code), {
      code: error.code,
      details: error.details,
      occurrenceId: context.occurrenceId,
    })

  return internalError({ occurrenceId: reportDefect(error) })
```

### framework-refusal-answered-as-the-callers-failure → expected-failure-carries-a-stable-code · MUST

Every refusal the framework raises before an operation runs is answered as the caller's failure of its kind. Such refusals include a refused input and an unknown operation.

#### Why

A refusal answered as an internal error tells its caller to retry, unchanged, a request it has to fix.

#### Examples

```pseudo title="Avoid"
function answerFailure(error, context)
  if isExpectedFailure(error) then
    return callerFailure(error.code, error.details, context.occurrenceId)

  return internalError({ occurrenceId: reportDefect(error) })  # a refused input lands here too
```

```pseudo title="Prefer"
function answerFailure(error, context)
  if isExpectedFailure(error) then
    return callerFailure(error.code, error.details, context.occurrenceId)
  if error is InputRefused then
    return callerFailure("request.invalid-input", { fields: error.fields }, context.occurrenceId)
  if error is UnknownOperation then
    return callerFailure("request.unknown-operation", { name: error.operation }, context.occurrenceId)

  return internalError({ occurrenceId: reportDefect(error) })
```

### refused-input-answer-names-each-field-by-path · SHOULD

Every answer to a refused input names the path of each field it refused.

#### Why

An answer that does not point at the field leaves its caller guessing what to fix.

#### Examples

```text title="Avoid"
{
  "code": "request.invalid-input",
  "details": { "message": "The order is invalid." },
  "occurrenceId": "occ_9e2c41a7f0"
}
```

```text title="Prefer"
{
  "code": "request.invalid-input",
  "details": {
    "fields": [
      { "path": "lines[2].quantity", "problem": "must be at least 1" },
      { "path": "delivery.postcode", "problem": "is required" }
    ]
  },
  "occurrenceId": "occ_9e2c41a7f0"
}
```

### defect-answered-as-an-internal-error → failure-is-expected-or-defect · MUST

Every defect of a request is answered as an internal error.

#### Why

A defect answered as the caller's failure tells the caller to change a request that was never wrong, and hides the bug from whoever watches the internal errors.

#### Examples

```pseudo title="Avoid"
function answerFailure(error, context)
  if isExpectedFailure(error) then
    return callerFailure(error.code, error.details, context.occurrenceId)

  return callerFailure("request.failed", {}, reportDefect(error))
```

```pseudo title="Prefer"
function answerFailure(error, context)
  if isExpectedFailure(error) then
    return callerFailure(error.code, error.details, context.occurrenceId)

  return internalError({ occurrenceId: reportDefect(error) })
```

### defect-answered-masked → failure-shown-as-what-happened-and-what-next · MUST

Every defect of a request reaches its caller masked, with no message, class, stack trace or cause of it.

#### Why

A defect's message and trace tell an attacker how the program works and which of its parts broke.

#### Examples

```text title="Avoid"
{
  "code": "internal",
  "message": "column \"customer_ref\" does not exist",
  "stack": "at OrderQueries.find (orders/infrastructure/store/order.queries:42)",
  "occurrenceId": "occ_7f3a9c2e41"
}
```

```text title="Prefer"
{
  "code": "internal",
  "occurrenceId": "occ_7f3a9c2e41"
}
```

### failure-answer-names-its-occurrence · SHOULD

Every failure answer carries an identifier of its occurrence, by which the program's operators find what the program recorded of it.

#### Why

A masked answer otherwise leaves a caller nothing to quote to support, and support nothing to search for.

#### Examples

```text title="Avoid"
{
  "code": "payment.declined",
  "details": { "orderId": "ord-7" }
}
```

```text title="Prefer"
{
  "code": "payment.declined",
  "details": { "orderId": "ord-7" },
  "occurrenceId": "occ_4b1d09e7c2"
}
```

## Raising

### error-carries-a-code-never-a-status → expected-failure-carries-a-stable-code · MUST

Every error the program raises while serving a request carries a code, never a status or an answer of the protocol.

#### Why

A status chosen where the error is raised ties that code to one protocol, and the answer is then decided in two places that drift apart.

#### Examples

```pseudo title="Avoid"
# checkout/domain/cart/errors/cart-empty.error
class CartEmptyError extends Error
  status = 422
  cartId: CartId
```

```pseudo title="Prefer"
# checkout/domain/cart/errors/cart-empty.error
class CartEmptyError extends Error
  code = "cart.empty"
  cartId: CartId
```
