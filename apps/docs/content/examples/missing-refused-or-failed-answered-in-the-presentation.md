```pseudo title="Avoid"
# orders/application/use-cases/queries/get-order
function createGetOrder({ orderQueries })
  return function(input, context)
    let order = orderQueries.find(input.orderId, context)

    if order is nothing then
      return notFound()

    return order
```

```pseudo title="Prefer"
# orders/application/use-cases/queries/get-order
function createGetOrder({ orderQueries })
  return function(input, context)
    let order = orderQueries.find(input.orderId, context)

    if order is nothing then
      throw new OrderNotFoundError(input.orderId)

    return order

# orders/presentation/bindings/queries/show-order
function showOrder(request, getOrder, context)
  try
    return ok(getOrder(parseGetOrderInput(request.params), context))
  catch OrderNotFoundError
    return notFound()
```
