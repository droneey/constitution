```pseudo title="Avoid"
# pay-order.use-case.test
function fakeGateway()
  return { charge: approve }

# refund-order.use-case.test
function fakeGateway()
  return { charge: approve,
    refund: approve }
```

```pseudo title="Prefer"
# __tests__/payment-gateway.fake
type PaymentGatewayFake = {
  charges: Charge[], refunds: Refund[] }

# __tests__/payment-gateway.suite
function paymentGatewaySuite(newGateway)
  test "should refund the charge it took"
    ...

# __tests__/payment-gateway.fake.test
paymentGatewaySuite(newPaymentGatewayFake)

# infrastructure/stripe/__tests__/payment-gateway.integration.test
paymentGatewaySuite(newStripePaymentGateway)
```
