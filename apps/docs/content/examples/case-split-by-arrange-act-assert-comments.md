```pseudo title="Avoid"
test "should refund a paid order"
  let order = anOrder({ status: Paid })
  let refund = refundOrder(order)
  let mail = receiptFor(refund)
  assert refund is aRefund()
  assert mail.to is "ann@example.com"
```

```pseudo title="Prefer"
test "should refund a paid order"
  # Arrange
  let order = anOrder({ status: Paid })
  # Act
  let refund = refundOrder(order)
  # Assert
  assert refund is aRefund()
```
