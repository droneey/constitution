```pseudo title="Avoid"
test "should cancel a paid order"
  # Arrange
  let order = createOrder({ status: Paid })
  let orderRepository = new OrderRepositoryFake([order])
  let cancelOrder = createCancelOrder({ orderRepository })
  let context = createContext()

  # Act
  cancelOrder({ orderId: order.id }, context)
  # Assert
  assert orderRepository.updates is [order.id]
```

```pseudo title="Prefer"
test "should cancel a paid order"
  # Arrange
  let order = createOrder({ status: Paid })
  let orderRepository = new OrderRepositoryFake([order])
  let cancelOrder = createCancelOrder({ orderRepository })
  let context = createContext()

  # Act
  cancelOrder({ orderId: order.id }, context)
  # Assert
  assert orderRepository.find(order.id).status is Cancelled
```
