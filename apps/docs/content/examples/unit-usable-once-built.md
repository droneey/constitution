```pseudo title="Avoid"
let mailer = new Mailer()
# forget one, and send fails
mailer.connect(smtpHost)
mailer.setSender(billingAddress)
mailer.send(invoiceEmail)
```

```pseudo title="Prefer"
let mailer = createMailer({
  host: smtpHost,
  sender: billingAddress
})
mailer.send(invoiceEmail)
```
