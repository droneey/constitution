```pseudo title="Avoid"
let gateway =
  if env.name is "production" then
    new LiveGateway()
  else
    new SandboxGateway()
```

```pseudo title="Prefer"
let gateway =
  if config.paymentsSandbox then
    new SandboxGateway()
  else
    new LiveGateway()
```
