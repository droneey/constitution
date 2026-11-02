```pseudo title="Avoid"
function isSameCustomer(a, b)
  return a equals b
```

```pseudo title="Prefer"
function isSameCustomer(a, b)
  return a.id is b.id
```
