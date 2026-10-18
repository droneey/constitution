```pseudo title="Avoid"
type User = {
  middleName: String,  # "" if none
  deletedAt: Instant,  # epoch if none
  managerId: UserId    # "-" if none
}
```

```pseudo title="Prefer"
type User = {
  middleName: String | nothing,
  deletedAt: Instant | nothing,
  managerId: UserId | nothing
}
```
