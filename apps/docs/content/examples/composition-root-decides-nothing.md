```pseudo title="Avoid"
# root/notifications
function mailerFor(config, smtpClient)
  if config.mailTransport is Smtp then
    return createSmtpMailer(smtpClient)

  return createConsoleMailer(output)
```

```pseudo title="Prefer"
# root/notifications
let mailersByTransport = {
  Smtp: createSmtpMailer,
  Console: createConsoleMailer
}

let mailer = mailersByTransport[config.mailTransport]({ smtpClient, output })
```
