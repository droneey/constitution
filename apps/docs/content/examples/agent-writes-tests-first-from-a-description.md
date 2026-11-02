```pseudo
# Described: "a paid order can be refunded". The test is written from
# these words first, before refundOrder exists.

test "should refund the order when it is paid"
  # Arrange
  let orderRepository = new OrderRepositoryFake([createOrder({ id: orderId, status: Paid })])
  let refundOrder = createRefundOrder({ orderRepository })
  let context = createContext()

  # Act
  call refundOrder({ orderId }, context)
  # Assert
  expect(orderRepository.find(orderId).status).toBe(Refunded)
```
