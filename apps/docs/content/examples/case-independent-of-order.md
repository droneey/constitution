```pseudo title="Avoid"
let carts = new CartRepositoryFake()

test "should add a mug to the cart"
  # ...
  addProduct({ cartId: "cart-1", product: createMug() }, carts)

test "should total the cart at 12"
  # Arrange: the mug added above
  # Act
  let total = carts.find("cart-1").total

  # Assert
  assert total is 12
```

```pseudo title="Prefer"
test "should total the cart at 12"
  # Arrange
  let cart = createCart({ products: [createMug()] })
  # Act
  let total = Cart.total(cart)

  # Assert
  assert total is 12
```
