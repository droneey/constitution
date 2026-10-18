```pseudo title="Avoid"
# nested repetition backtracks
let couponCode = /^(\w+-?)*$/
```

```pseudo title="Prefer"
# no repetition inside repetition
let couponCode = /^[\w-]*$/
```
