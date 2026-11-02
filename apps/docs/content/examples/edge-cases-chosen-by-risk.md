```pseudo
# addToCart(input, carts) takes a quantity from 1 to 99
suite "addToCart"
  # empty input
  test "should add the product when the cart is empty"
  # on and off each limit
  test "should add the product when the quantity is 1"
  test "should add the product when the quantity is 99"
  test "should fail with InvalidQuantityError when the quantity is 0"
  test "should fail with InvalidQuantityError when the quantity is 100"
  # Unicode and invalid input
  test "should keep the product name when it is Crème brûlée"
  test "should fail with InvalidQuantityError when it is not a number"
  # a concurrent call and a lost connection
  test "should add both products when two calls add at once"
  test "should fail with StockUnavailableError when the stock is offline"
```
