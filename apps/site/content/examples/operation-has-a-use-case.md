```pseudo title="Avoid"
# orders/app/show-order
function showOrder(request)
  return orderQueries.find(request.id)
```

```pseudo title="Prefer"
# orders/domain/use-cases/get-order
function getOrder(orderId)
  return orderQueries.find(orderId)

# orders/app/show-order
function showOrder(request)
  return getOrder(request.id)
```
