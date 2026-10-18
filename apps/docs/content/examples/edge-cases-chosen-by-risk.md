```pseudo
# addToCart(cart, item, quantity) takes a quantity from 1 to 99
suite "addToCart"
  # empty input
  test "should add the item when the cart is empty"
  # on and off each limit
  test "should add the item when the quantity is 1"
  test "should add the item when the quantity is 99"
  test "should fail with InvalidQuantity when the quantity is 0"
  test "should fail with InvalidQuantity when the quantity is 100"
  # Unicode and invalid input
  test "should keep the item name when it is Crème brûlée"
  test "should fail with InvalidQuantity when it is not a number"
  # a concurrent call and a lost connection
  test "should add both items when two calls add at once"
  test "should fail with StockUnavailable when the stock is offline"
```
