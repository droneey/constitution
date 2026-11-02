```pseudo title="Avoid"
interface IPaymentPort
type OrderType = { ... }
class InvoiceClass
```

```pseudo title="Prefer"
interface PaymentPort
type Order = { ... }
class Invoice
type OrderNotFoundError      # a word for its role, not for its construct
```
