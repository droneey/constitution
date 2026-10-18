```pseudo title="Avoid"
test "should email the receipt"
  # Arrange
  mockModule("../adapters/smtp")
  # Act
  payOrder(anOrder())
  # Assert
  assert smtp.send.calls
    is [aReceipt()]
```

```pseudo title="Prefer"
test "should email the receipt"
  # Arrange
  let mailer = new MailerFake()
  # Act
  payOrder(anOrder(), mailer)
  # Assert
  assert mailer.outbox
    is [aReceipt()]
```
