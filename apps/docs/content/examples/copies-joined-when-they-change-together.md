```pseudo title="Avoid"
function addressLines(address, { isLabel })
  if isLabel then
    return [address.name,
      address.street, address.postcode]

  return [address.name, address.street]
```

```pseudo title="Prefer"
function shippingLabel(address)
  return [address.name,
    address.street, address.postcode]

function invoiceHeader(address)
  return [address.name, address.street]
```
