```pseudo title="Avoid"
function saveUser(user, notify)

saveUser(user, true)
```

```pseudo title="Prefer"
function saveUser(user, options)

saveUser(user, { notify: true })
```
