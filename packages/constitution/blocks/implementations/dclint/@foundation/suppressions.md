# Suppressions

> Governs dclint's suppressions.

## General

### dclint-disable-line-comment → suppression-silences-one-finding · MUST

Every dclint suppression is a `# dclint disable-line <rule>` comment naming its rule. It stands on the line it silences or alone on the line above it, never as a `# dclint disable` that covers the file.

#### Why

A `disable-line` that names no rule silences every rule on its line, and `# dclint disable` silences its rules for every service of the file.

#### Examples

```yaml title="Avoid"
# dclint disable
services:
  shop-api:
    build: .
    image: registry.shop.example/shop-api:2.4.0
    security_opt: ['no-new-privileges:true']
    cap_drop: [ALL]
    read_only: true
```

```yaml title="Prefer"
services:
  shop-api:
    build: .
    # Why: the build tags the image the release pushes
    image: registry.shop.example/shop-api:2.4.0 # dclint disable-line no-build-and-image
    security_opt: ['no-new-privileges:true']
    cap_drop: [ALL]
    read_only: true
```
