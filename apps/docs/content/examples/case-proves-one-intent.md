```pseudo title="Avoid"
test "should apply the coupon"
  # Arrange
  let cart = createCart({ total: 100 })
  # Act
  let discounted = applyCoupon(cart, "TEN")

  # Assert
  assert discounted.total is 90
  assert discounted.coupon is not nothing
```

```pseudo title="Prefer"
test "should apply the coupon"
  # Arrange
  let cart = createCart({ total: 100 })
  # Act
  let discounted = applyCoupon(cart, "TEN")

  # Assert
  assert { total: discounted.total, coupon: discounted.coupon }
    is { total: 90, coupon: "TEN" }
```
