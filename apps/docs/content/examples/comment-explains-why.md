```pseudo title="Avoid"
# add one day to the issue date
let settlesOn = issuedOn.plusDays(1)
```

```pseudo title="Prefer"
# the bank settles a day after issue
let settlesOn = issuedOn.plusDays(1)
```
