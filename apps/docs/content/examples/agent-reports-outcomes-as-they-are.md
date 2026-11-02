```text title="Avoid"
Done. All tests pass and the
migration works.
```

```text title="Prefer"
Done, with one failure:
  FAIL refund-order.use-case.test
    should refund the order when
    it is paid
    expected Refunded, got Paid
Skipped: the migration, as no
database was reachable.
```
