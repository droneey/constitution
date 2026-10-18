```pseudo title="Avoid"
# composition/refunds/app/refund
import Receipt from "composition/cart"

function refund(receipt: Receipt)
  return refundPayment(receipt.total)
```

```pseudo title="Prefer"
# composition/refunds/app/refund
import Receipt from "kernel"

function refund(receipt: Receipt)
  return refundPayment(receipt.total)
```
