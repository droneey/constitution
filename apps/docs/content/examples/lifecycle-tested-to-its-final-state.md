```pseudo
test "should take an order from draft to delivered"
  # Arrange
  let draft = createOrder({ id: "order-7", items: [aLineItem()] })
  # Act
  let paid = pay(draft)
  # Assert
  assert paid is { ...draft, status: Paid }
  # Act
  let shipped = ship(paid, "TRACK-42")
  # Assert
  assert shipped is { ...paid, status: Shipped, tracking: "TRACK-42" }
  # Act
  let delivered = deliver(shipped)
  # Assert
  assert delivered is { ...shipped, status: Delivered }
```
