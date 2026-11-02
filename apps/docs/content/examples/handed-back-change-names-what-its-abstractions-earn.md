```text title="Avoid"
Done. Added the Payment port,
the Stripe adapter, Money and
a RetryPolicy.
```

```text title="Prefer"
Done. What each addition earns:
  Payment port: the boundary
    with Stripe
  Stripe adapter: the one
    implementation of it
  Money: the invariant that an
    amount keeps its currency
RetryPolicy earned nothing yet;
I left it out.
```
