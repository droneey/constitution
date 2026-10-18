```pseudo title="Avoid"
# orders/domain/use-cases/confirm-order
import SmtpMailer from "adapters/smtp"

function confirmOrder(order)
  let mailer = new SmtpMailer()
  mailer.send(order.customerEmail)
```

```pseudo title="Prefer"
# orders/domain/use-cases/confirm-order
function confirmOrder(order, mailer)
  mailer.send(order.customerEmail)

# root/wiring
import SmtpMailer from "adapters/smtp"
let mailer = new SmtpMailer()
```
