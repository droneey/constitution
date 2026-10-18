```pseudo title="Avoid"
test "should refund a paid order"
  # Arrange
  let order = { id: "order-7",
    userId: "user-3", total: 12,
    items: [{ sku: "mug", qty: 1 }],
    currency: "EUR", status: Paid }
  # Act
  let refund = refundOrder(order)
  # Assert
  assert refund
    is aRefund({ total: 12 })
```

```pseudo title="Prefer"
# orders.fixtures
function anOrder(overrides)
  return { id: "order-7", total: 12,
    status: Draft, ...overrides }
test "should refund a paid order"
  # Arrange
  let order = anOrder({ status: Paid })
  # Act
  let refund = refundOrder(order)
  # Assert
  assert refund
    is aRefund({ total: 12 })
```
