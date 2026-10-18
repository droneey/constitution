```pseudo title="Avoid"
# orders/app/show-order
function showOrder(request)
  return getOrder(request.id)

# registers itself on import
router.get("/orders/:id", showOrder)

# root/routes
call loadEvery("features/*/app")
```

```pseudo title="Prefer"
# orders/app/show-order
function showOrder(request)
  return getOrder(request.id)

# root/routes
import listOrders from "orders"
import showOrder from "orders"

router.get("/orders", listOrders)
router.get("/orders/:id", showOrder)
```
