```yaml title="Avoid"
# presets/dependency-cruiser/@architecture.yaml
core:
  domain-imports-only-itself-and-the-kernel:
    typescript:
      .dependency-cruiser.jsonc:
        forbidden[name=domain-reaches-only-itself-and-the-kernel]:
          from:
            path: ^src/features/([^/]+)/domain/
```

```yaml title="Prefer"
# presets/dependency-cruiser/@architecture.yaml
core:
  domain-imports-only-itself-and-the-kernel:
    typescript:
      .dependency-cruiser.jsonc:
        forbidden[name=domain-reaches-only-itself-and-the-kernel]:
          from:
            path: ^${role.source}/${role.bounded-context}/([^/]+)/${role.domain-layer}/
```
