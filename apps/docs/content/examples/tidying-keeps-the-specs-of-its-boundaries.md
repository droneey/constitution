```text title="Avoid"
refactor: Extract tax calculation

  orders/__tests__/total.test.ts
- expect(total).is(110)
+ expect(total).is(100)
```

```text title="Prefer"
refactor: Move tax to its module

  tax/__tests__/total.test.ts
- import "orders/total"
+ import "tax/total"
  expect(total).is(110)
```
