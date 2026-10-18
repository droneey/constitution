```text title="Avoid"
task: refund a paid order

M orders/refund.ts
M orders/refund.spec.ts
M users/profile.ts  # renamed
M README.md         # reformatted
```

```text title="Prefer"
task: refund a paid order

M orders/refund.ts
M orders/refund.spec.ts

reported: users/profile.ts names
  its fields unclearly
```
