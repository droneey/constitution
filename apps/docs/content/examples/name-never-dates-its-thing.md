```pseudo title="Avoid"
function newParser(text)
let oldClient = connect(address)
type InvoiceV2
```

```pseudo title="Prefer"
function parseInvoice(text)
let reportingClient = connect(address)
type Invoice
let newCustomers = listCustomersJoinedIn(month)  # a word of the business
def __new__(cls, text)                # Python's constructor hook keeps its name
```
