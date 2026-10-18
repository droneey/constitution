```pseudo title="Avoid"
function labelOf(status: OrderStatus)
  when status
    is Draft then return "Draft"
    is Paid then return "Paid"
    else return "Shipped"
# a new Cancelled reads "Shipped"
```

```pseudo title="Prefer"
function labelOf(status: OrderStatus)
  when status
    is Draft then return "Draft"
    is Paid then return "Paid"
    is Shipped then return "Shipped"
# no else: the checker proves every
# member is named
```
