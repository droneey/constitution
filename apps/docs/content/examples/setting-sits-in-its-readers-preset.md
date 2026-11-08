```yaml title="Avoid"
# presets/dependency-cruiser/@foundation.yaml
core:
  domain-imports-only-itself-and-the-kernel:
    typescript:
      .dependency-cruiser.jsonc:
        forbidden[name=domain-reaches-only-itself-and-the-kernel]:
          severity: error
```

```yaml title="Prefer"
# presets/dependency-cruiser/@architecture.yaml
core:
  domain-imports-only-itself-and-the-kernel:
    typescript:
      .dependency-cruiser.jsonc:
        forbidden[name=domain-reaches-only-itself-and-the-kernel]:
          severity: error
```
