```pseudo title="Avoid"
function remindAll(users)
  await all(users.map(sendReminder))
```

```pseudo title="Prefer"
function remindAll(users)
  await forEachConcurrently(users, {
    limit: maxConcurrentSends,
    run: sendReminder,
  })
```
