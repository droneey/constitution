```pseudo title="Avoid"
let data = getCustomer(customerId)
let result = calculateTax(invoice)
let info = getAddress(data)
```

```pseudo title="Prefer"
let customer = getCustomer(customerId)
let tax = calculateTax(invoice)
let address = getAddress(customer)
```
