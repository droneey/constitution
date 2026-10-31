```pseudo title="Avoid"
# orders/application/use-cases/confirm-order
import SmtpMailer from "infrastructure/smtp"

function confirmOrder(order)
  let mailer = new SmtpMailer()
  mailer.send(order.customerEmail)
```

```pseudo title="Prefer"
# orders/application/use-cases/confirm-order
function confirmOrder(order, mailer)
  mailer.send(order.customerEmail)

# root/wiring
import SmtpMailer from "infrastructure/smtp"
let mailer = new SmtpMailer()
```
