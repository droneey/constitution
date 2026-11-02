```pseudo title="Avoid"
# invoices/application/use-cases/commands/send-invoice
function createSendInvoice({ invoiceRepository })
  return function(input, context)
    let host = env("SMTP_HOST")
    let invoice = invoiceRepository.find(input.invoiceId, context)

    new Mailer(host).send(invoice)
```

```pseudo title="Prefer"
# infrastructure/config: the configuration provider
let Config = {
  smtpHost: Host,
}

# Why: a missing or malformed setting fails the start, before any work
function parseConfig(env)
  return parse(Config, env)

# root/run
function run(env)
  let config = parseConfig(env)
  let smtp = new SmtpClient(config.smtpHost)

  stop.release(smtp)

  let mailer = createSmtpMailer(smtp)

# main.ts
import run from "root"

run(process.env)

# invoices/application/use-cases/commands/send-invoice
function createSendInvoice({ invoiceRepository, mailer: Mailer })
  return function(input, context)
    let invoice = invoiceRepository.find(input.invoiceId, context)

    call mailer.send(invoice, context)
```
