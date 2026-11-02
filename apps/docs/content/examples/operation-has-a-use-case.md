```pseudo title="Avoid"
# orders/presentation/bindings/queries/show-order
function showOrder(request, orderQueries)
  return orderQueries.find(request.params.orderId)
```

```pseudo title="Prefer"
# orders/application/use-cases/queries/get-order
function createGetOrder({ orderQueries })
  return function(input, context)
    return orderQueries.find(input.orderId, context)

# orders/presentation/bindings/queries/show-order
function showOrder(request, getOrder, context)
  let input = parseGetOrderInput(request.params)

  return ok(getOrder(input, context))
```
