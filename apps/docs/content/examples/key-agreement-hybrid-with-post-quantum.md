```yaml title="Avoid"
tls:
  groups: [X25519]
```

```yaml title="Prefer"
tls:
  groups:
    - X25519MLKEM768
    - X25519
```
