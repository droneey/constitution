```pseudo title="Avoid"
# composition/refunds/presentation/refund
import Receipt from "composition/cart"

function refund(receipt: Receipt)
  return refundPayment(receipt.total)
```

```pseudo title="Prefer"
# composition/refunds/presentation/refund
import Receipt from "kernel"

function refund(receipt: Receipt)
  return refundPayment(receipt.total)
```
