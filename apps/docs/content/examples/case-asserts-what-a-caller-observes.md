```pseudo title="Avoid"
test "should cancel a paid order"
  # Arrange
  let order = anOrder({ status: Paid })
  let orders = new OrderRepositoryFake()
  orders.save(order)
  # Act
  cancelOrder(orders, order.id)
  # Assert
  assert orders.updates is [order.id]
```

```pseudo title="Prefer"
test "should cancel a paid order"
  # Arrange
  let order = anOrder({ status: Paid })
  let orders = new OrderRepositoryFake()
  orders.save(order)
  # Act
  cancelOrder(orders, order.id)
  # Assert
  assert orders.find(order.id)
    is anOrder({ status: Cancelled })
```
