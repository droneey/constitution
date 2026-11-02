```pseudo title="Avoid"
# composition/refunds/presentation/bindings/commands/refund
import Receipt from "composition/cart"

function refund(receipt: Receipt, refundPayment, context)
  let input = parseRefundPaymentInput({ amount: receipt.total })

  call refundPayment(input, context)
```

```pseudo title="Prefer"
# composition/refunds/presentation/bindings/commands/refund
import Receipt from "kernel"

function refund(receipt: Receipt, refundPayment, context)
  let input = parseRefundPaymentInput({ amount: receipt.total })

  call refundPayment(input, context)
```
