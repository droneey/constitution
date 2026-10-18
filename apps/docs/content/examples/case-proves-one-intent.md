```pseudo title="Avoid"
test "should apply the coupon"
  # Arrange
  let cart = aCart({ total: 100 })
  # Act
  let result = applyCoupon(cart, "TEN")
  # Assert
  assert result.total is 90
  assert result.coupon is not nothing
```

```pseudo title="Prefer"
test "should apply the coupon"
  # Arrange
  let cart = aCart({ total: 100 })
  # Act
  let result = applyCoupon(cart, "TEN")
  # Assert
  assert result is aCart({
    total: 90, coupon: "TEN" })
```
