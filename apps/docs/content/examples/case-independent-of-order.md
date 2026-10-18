```pseudo title="Avoid"
let carts = new CartRepositoryFake()

test "should add a mug to the cart"
  # ...
  addItem(carts, "cart-1", aMug())

test "should total the cart at 12"
  # Arrange: the mug added above
  # Act
  let total = cartTotal(carts, "cart-1")
  # Assert
  assert total is 12
```

```pseudo title="Prefer"
test "should total the cart at 12"
  # Arrange
  let cart = aCart({ items: [aMug()] })
  let carts = new CartRepositoryFake()
  carts.save(cart)
  # Act
  let total = cartTotal(carts, cart.id)
  # Assert
  assert total is 12
```
