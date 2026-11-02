```text title="Avoid"
task: refund a paid order

M orders/refund.ts
M orders/__tests__/refund.test.ts
M users/profile.ts  # renamed
M README.md         # reformatted
```

```text title="Prefer"
task: refund a paid order

M orders/refund.ts
M orders/__tests__/refund.test.ts

reported: users/profile.ts names
  its fields unclearly
```
