```text title="Avoid"
CONTRIBUTING.md

Keep each function under
40 lines.
```

```yaml title="Prefer"
# lint.yaml
rules:
  max-function-lines:
    level: error
    max: 40
```
