```pseudo title="Avoid"
# the first problem only, by value
throw new InvalidOrderError({
  problem: "bob@ is not an email"
})
```

```pseudo title="Prefer"
throw new InvalidOrderError({
  problems: [
    { path: "email",
      problem: "format" },
    { path: "lines[0].quantity",
      problem: "below minimum" }
  ]
})
```
