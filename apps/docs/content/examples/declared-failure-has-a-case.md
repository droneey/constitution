```pseudo
# cancelOrder declares two failures: OrderNotFound, InvalidOrderId
test "should fail with OrderNotFound when the order does not exist"
  # Arrange
  let orders = new OrderRepositoryFake()
  # Act
  let result = cancelOrder(orders, "order-404")
  # Assert
  assert result is OrderNotFound({ orderId: "order-404" })

test "should fail with InvalidOrderId when the id is empty"
  # Arrange
  let orders = new OrderRepositoryFake()
  # Act
  let result = cancelOrder(orders, "")
  # Assert
  assert result is InvalidOrderId({ orderId: "" })
```
