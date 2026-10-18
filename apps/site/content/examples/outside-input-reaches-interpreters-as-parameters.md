```pseudo title="Avoid"
query("select * from users " +
  "where email = '" + email + "'")
```

```pseudo title="Prefer"
query("select * from users " +
  "where email = $1", [email])
```
