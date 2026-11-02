```text title="Avoid"
Sub-agent: Order 8812 was stuck:
           its payment call timed
           out. I ran the payment
           again in production.
```

```text title="Prefer"
Sub-agent: Order 8812 is stuck:
           its payment call timed
           out. Running it again
           is not mine to do.
Agent:     Order 8812's payment
           timed out. Run it again
           in production?
```
