```pseudo title="Avoid"
test "should expire an idle cart"
  # Arrange
  let clock = new SystemClock()
  let cart = aCart({ ttl: seconds(2) })
  sleep(seconds(3))
  # Act
  let expired = isExpired(cart, clock)
  # Assert
  assert expired is true
```

```pseudo title="Prefer"
test "should expire an idle cart"
  # Arrange
  let clock = new ClockFake("10:00")
  let cart = aCart({ ttl: minutes(30) })
  clock.advance(minutes(31))
  # Act
  let expired = isExpired(cart, clock)
  # Assert
  assert expired is true
```
