```pseudo title="Avoid"
# orders/domain/order-status.ts
let orderStatuses = ["draft", "paid",
  "shipped", "cancelled"]

# billing/domain/refund.ts
if status in ["paid", "shipped"]
  then refundOrder(order)
```

```pseudo title="Prefer"
# orders/domain/order-status.ts
let orderStatuses = ["draft", "paid",
  "shipped", "cancelled"]
let refundableStatuses =
  ["paid", "shipped"]

# billing/domain/refund.ts
if status in refundableStatuses
  then refundOrder(order)
```
