```pseudo title="Avoid"
# next = "https://evil.example"
return redirect(request.query.next)
```

```pseudo title="Prefer"
let next = request.query.next
if allowedReturnPaths.has(next)
  return redirect(next)
return redirect("/orders")
```
