```pseudo title="Avoid"
# builds any object the sender names
let cart = deserializeObject(cookie)
```

```pseudo title="Prefer"
# plain data, then the program's type
let cart = parseCart(parseJson(cookie))
```
