```pseudo title="Avoid"
# __tests__/pay-order.use-case.test
function fakePayment()
  return { charge: approve }

# __tests__/refund-order.use-case.test
function fakePayment()
  return { charge: approve,
    refund: approve }
```

```pseudo title="Prefer"
# __tests__/payment.fake
type PaymentFake = {
  charges: Charge[], refunds: Refund[] }

# __tests__/payment.suite
function paymentSuite(createPayment)
  test "should refund the charge it took"
    ...

# __tests__/payment.fake.test
paymentSuite(createPaymentFake)

# infrastructure/stripe/__tests__/payment.adapter.integration.test
paymentSuite(createStripePaymentAdapter)
```
