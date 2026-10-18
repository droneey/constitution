```pseudo title="Avoid"
# name = "../../etc/passwd"
return readFile(
  join(invoicesRoot, name))
```

```pseudo title="Prefer"
let path = realPath(
  join(invoicesRoot, name))
if not isInside(path, invoicesRoot)
  throw PathOutsideRootError
return readFile(path)
```
