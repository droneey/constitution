```pseudo title="Avoid"
let paid = invoice.balance is 0
let notOverdue = today <= invoice.dueOn

if not notOverdue and not paid then
  sendReminder(invoice)
```

```pseudo title="Prefer"
let isPaid = invoice.balance is 0
let isOverdue = today > invoice.dueOn

if isOverdue and not isPaid then
  sendReminder(invoice)
```
