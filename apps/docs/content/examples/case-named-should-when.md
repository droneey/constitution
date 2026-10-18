```pseudo title="Avoid"
suite "OrderServiceTests"
  test "cancel"
  test "cancel 2"
  test "test refund"
```

```pseudo title="Prefer"
suite "cancelOrder"
  test "should cancel a draft order"
  test "should refund when it is paid"
  test "should fail when it has shipped"
```
