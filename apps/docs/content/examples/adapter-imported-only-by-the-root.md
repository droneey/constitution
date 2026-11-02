```pseudo title="Avoid"
# orders/application/use-cases/commands/confirm-order
import SmtpMailer from "infrastructure/smtp"

function createConfirmOrder({ orderRepository })
  return function(input, context)
    let order = orderRepository.find(input.orderId, context)
    let mailer = new SmtpMailer(smtpClient)
    mailer.send(order.customerEmail, context)
```

```pseudo title="Prefer"
# orders/application/use-cases/commands/confirm-order
function createConfirmOrder({ orderRepository, mailer })
  return function(input, context)
    let order = orderRepository.find(input.orderId, context)
    mailer.send(order.customerEmail, context)

# root/orders
import SmtpMailer from "infrastructure/smtp"

let mailer = new SmtpMailer(smtpClient)
let confirmOrder = createConfirmOrder({ orderRepository, mailer })
```
