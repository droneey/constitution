```md title="Avoid"
### outside-call-has-a-timeout · MUST

Where it reaches a store, a broker or another service, a call
across a process boundary has a timeout.
```

```md title="Prefer"
### outside-call-has-a-timeout · MUST

Every call across a process boundary has a timeout. It holds for
a store, a broker or another service alike.
```
