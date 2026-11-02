```pseudo
# cancelOrder declares OrderNotFoundError;
# parseCancelOrderInput, offered beside it, declares InvalidOrderIdError
test "should fail with OrderNotFoundError when the order does not exist"
  # Arrange
  let orderRepository = new OrderRepositoryFake()
  let cancelOrder = createCancelOrder({ orderRepository })
  let context = createContext()
  # Act
  let failure = thrownBy(function() cancelOrder({ orderId: "order-404" }, context))

  # Assert
  assert failure is OrderNotFoundError({ orderId: "order-404" })

test "should fail with InvalidOrderIdError when the id is empty"
  # Act
  let failure = thrownBy(function() parseCancelOrderInput({ orderId: "" }))

  # Assert
  assert failure is InvalidOrderIdError(
    { problems: [{ path: "orderId", problem: "empty" }] })
```
