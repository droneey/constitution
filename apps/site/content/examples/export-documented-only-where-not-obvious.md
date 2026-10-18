```pseudo title="Avoid"
# Refunds a payment.
# payment: the payment to refund
# amount: the amount to refund
# returns: the Refund
export function refund(
  payment: Payment,
  amount: Money,
): Refund
```

```pseudo title="Prefer"
# Throws RefundTooLarge when amount
# exceeds what is left to refund.
# Emails the customer a receipt.
export function refund(
  payment: Payment,
  amount: Money,
): Refund
```
