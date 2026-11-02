```pseudo title="Avoid"
test "should refund a paid order"
  let order = createOrder({ status: Paid })
  let refund = refundFor(order)
  let mail = receiptFor(refund)

  assert refund is createRefund()
  assert mail.to is "ann@example.com"
```

```pseudo title="Prefer"
test "should refund a paid order"
  # Arrange
  let order = createOrder({ status: Paid })
  # Act
  let refund = refundFor(order)

  # Assert
  assert refund is createRefund()
```
