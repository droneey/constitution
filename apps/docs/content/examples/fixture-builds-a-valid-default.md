```pseudo title="Avoid"
test "should refund a paid order"
  # Arrange
  let order = { id: "order-7",
    userId: "user-3", total: 12,
    lines: [{ sku: "mug", qty: 1 }],
    currency: "EUR", status: Paid }
  # Act
  let refund = refundFor(order)

  # Assert
  assert refund
    is createRefund({ total: 12 })
```

```pseudo title="Prefer"
# __tests__/orders.fixtures
function createOrder(overrides)
  return { id: "order-7", total: 12,
    status: Draft, ...overrides }

test "should refund a paid order"
  # Arrange
  let order = createOrder({ status: Paid })
  # Act
  let refund = refundFor(order)

  # Assert
  assert refund
    is createRefund({ total: 12 })
```
