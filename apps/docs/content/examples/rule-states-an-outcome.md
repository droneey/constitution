```md title="Avoid"
### resource-released-on-every-path · MUST

Every function that opens a file wraps its body in try and
finally, and closes the file in the finally.
```

```md title="Prefer"
### resource-released-on-every-path · MUST

A resource the code acquires is released on every way out, a
failure's included.
```
