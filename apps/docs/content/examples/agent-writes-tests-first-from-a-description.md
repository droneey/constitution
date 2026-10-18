```pseudo
# Described: "a paid order can be refunded". The test is written from
# these words first, before refundOrder exists.

test "should refund the order when it is paid"
  # Arrange
  let orders = fakeOrders([anOrder({ id: orderId, status: Paid })])
  # Act
  call refundOrder(orders, orderId)
  # Assert
  expect(orders.get(orderId).status).toBe(Refunded)
```
