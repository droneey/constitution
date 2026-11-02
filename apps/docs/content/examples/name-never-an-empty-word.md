```pseudo title="Avoid"
let data = findCustomer(customerId)
let result = Invoice.tax(invoice)
let info = Customer.address(data)
```

```pseudo title="Prefer"
let customer = findCustomer(customerId)
let tax = Invoice.tax(invoice)
let address = Customer.address(customer)
```
