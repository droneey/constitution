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

# pay-order.use-case.test
let gateway = new PaymentGatewayFake()

# refund-order.use-case.test
let gateway = new PaymentGatewayFake()
```
