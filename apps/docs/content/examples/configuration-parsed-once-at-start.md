```pseudo title="Avoid"
# invoices/send-invoice.ts
function sendInvoice(invoice)
  let host = env("SMTP_HOST")
  new Mailer(host).send(invoice)
```

```pseudo title="Prefer"
# main.ts
# fails the start on a missing setting
let config = parseConfig(env)
let mailer = new Mailer(config.smtpHost)

# invoices/send-invoice.ts
function sendInvoice(invoice, mailer)
  mailer.send(invoice)
```
