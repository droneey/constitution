```pseudo title="Avoid"
# the first problem only, by value
return failure(InvalidOrder, {
  problem: "bob@ is not an email"
})
```

```pseudo title="Prefer"
return failure(InvalidOrder, {
  problems: [
    { path: "email",
      problem: "format" },
    { path: "items[0].quantity",
      problem: "below minimum" }
  ]
})
```
