# Failures

> Governs the server's one handler of failures.

## General

### one-error-handler-registered-by-the-root → last-resort-handler-one-per-interface · MUST

The composition root registers one error handler on each server framework it mounts, which answers every failure that framework serves. It is the interface's handler of last resort, registered with the framework itself, so that it also answers a failure the framework raises before any operation runs.

#### Why

A failure the framework raises before any operation runs escapes every handler but one the framework itself calls, and two handlers on one framework answer the same failure in two shapes.

#### Examples

```pseudo title="Avoid"
# orders/presentation/bindings/queries/show-order
router.onError(answerOrdersFailure)

# billing/presentation/bindings/queries/show-invoice
router.onError(answerBillingFailure)
```

```pseudo title="Prefer"
# root/routes
import { answerFailure } from "presentation/answer-failure"
import { listOrders, showOrder } from "features/orders"
import { showInvoice } from "features/billing"

function mountRoutes(server)
  server.onError(answerFailure)
  server.get("/orders", listOrders)
  server.get("/orders/:id", showOrder)
  server.get("/invoices/:id", showInvoice)
```

### operation-never-answers-its-own-failure → missing-refused-or-failed-answered-in-the-presentation · MUST

No operation of a served API answers a failure it raised or was returned. Every such failure reaches the error handler the composition root registered, which decides its answer.

#### Why

An operation that answers its own failures gives them a shape of its own and may leave one unmasked, and what each failure answers is then decided in as many places as there are operations.

#### Examples

```pseudo title="Avoid"
# orders/presentation/bindings/queries/show-order
function showOrder(request, getOrder, context)
  try
    return ok(getOrder(parseGetOrderInput(request.params), context))
  catch OrderNotFoundError
    return failureAnswer({ code: "order.not-found" })
```

```pseudo title="Prefer"
# orders/presentation/bindings/queries/show-order
function showOrder(request, getOrder, context)
  let input = parseGetOrderInput(request.params)

  return ok(getOrder(input, context))
```
