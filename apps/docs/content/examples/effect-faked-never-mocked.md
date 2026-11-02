```pseudo title="Avoid"
test "should email the receipt"
  # Arrange
  let orderRepository = new OrderRepositoryFake([createOrder()])

  mockModule("../infrastructure/smtp")

  let payOrder = createPayOrder({ orderRepository })
  let context = createContext()

  # Act
  payOrder({ orderId: createOrder().id }, context)
  # Assert
  assert smtp.send.calls
    is [createReceipt()]
```

```pseudo title="Prefer"
test "should email the receipt"
  # Arrange
  let orderRepository = new OrderRepositoryFake([createOrder()])
  let mailer = new MailerFake()
  let payOrder = createPayOrder({ orderRepository, mailer })
  let context = createContext()

  # Act
  payOrder({ orderId: createOrder().id }, context)
  # Assert
  assert mailer.outbox
    is [createReceipt()]
```
