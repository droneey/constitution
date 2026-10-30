```pseudo title="Avoid"
# orders/presentation/show-order
function showOrder(request)
  return orderQueries.find(request.id)
```

```pseudo title="Prefer"
# orders/application/use-cases/get-order
function getOrder(orderId)
  return orderQueries.find(orderId)

# orders/presentation/show-order
function showOrder(request)
  return getOrder(request.id)
```
