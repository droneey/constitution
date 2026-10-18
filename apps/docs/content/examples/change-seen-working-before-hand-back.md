```text title="Avoid"
Done: refunds for paid orders.
The check passes.
```

```text title="Prefer"
Done: refunds for paid orders.
The check passes.

Seen working: POST /orders/42/refund
returned 200, and the order page
shows it as Refunded.
```
