```pseudo title="Avoid"
# Assert
assert result.message is
  "Order 42 was not found."
```

```pseudo title="Prefer"
# Assert
assert result.failure is {
  code: "order.not-found",
  orderId: "42",
}
```
