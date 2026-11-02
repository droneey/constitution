```text title="Avoid"
"should show the receipt"
  attempt 1  FAIL
  attempt 2  PASS  (retries: 3)
```

```text title="Prefer"
"should show the receipt"
  fails once in 40 runs: the
  receipt renders before the
  payment settles
next change: the case waits for
  the payment to settle
```
