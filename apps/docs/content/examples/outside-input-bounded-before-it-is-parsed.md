```pseudo title="Avoid"
let body = readAll(request)
let order = parseJson(gunzip(body))
```

```pseudo title="Prefer"
let body = readAtMost(request, 1 MB)
let json = gunzip(body, limit: 4 MB)
let order = parseJson(json,
  maxDepth: 32)
```
