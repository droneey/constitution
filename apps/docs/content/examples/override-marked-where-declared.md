```pseudo title="Avoid"
class PaymentDeclined
  extends AppError
  # overrides, but nothing says so
  function message()
    return "Card declined"
```

```pseudo title="Prefer"
class PaymentDeclined
  extends AppError
  override function message()
    return "Card declined"
```
