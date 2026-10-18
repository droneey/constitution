```text title="Avoid"
To the sub-agent:
  Fix the failing refund tests.

To the person:
  Fixed, says the sub-agent.
```

```text title="Prefer"
To the sub-agent:
  Fix the failing refund tests.
  Rules: core's tests and errors.
  Files: orders/domain/use-cases/
         commands/refund-order/

To the person:
  Fixed; I reran the specs, and
  they pass.
```
