```pseudo title="Avoid"
class PaymentDeclinedError
  extends AppError
  # overrides, but nothing says so
  function message()
    return "Card declined"
```

```pseudo title="Prefer"
class PaymentDeclinedError
  extends AppError
  override function message()
    return "Card declined"
```
