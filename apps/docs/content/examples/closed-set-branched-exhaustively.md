```pseudo title="Avoid"
function label(status: OrderStatus)
  when status
    is Draft then return "Draft"
    is Paid then return "Paid"
    else return "Shipped"
# a new Cancelled reads "Shipped"
```

```pseudo title="Prefer"
# Why: no else, so the checker proves every member is named
function label(status: OrderStatus)
  when status
    is Draft then return "Draft"
    is Paid then return "Paid"
    is Shipped then return "Shipped"
```
