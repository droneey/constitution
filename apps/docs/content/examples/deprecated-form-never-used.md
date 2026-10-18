```pseudo title="Avoid"
# payments 3.2: charge() is
# deprecated, use createCharge()
payments.charge(card, total)
```

```pseudo title="Prefer"
# payments 3.2: charge() is
# deprecated, use createCharge()
payments.createCharge(card, total)
```
