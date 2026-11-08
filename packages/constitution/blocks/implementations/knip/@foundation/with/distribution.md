# Distribution

> Governs a distributed package whose integration imports an optional peer.

## General

### optional-peer-ignored-in-production · MUST

Every optional peer an integration imports is ignored by the production runs alone. The framework an integration imports as an optional peer is listed in `ignoreDependencies` with `!`, `'<framework>!'`, in the configuration of the package that offers the integration.

#### Why

Knip's strict run counts only `dependencies` and the required peers, so it reports the integration's import as unlisted; the `!` form drops that report from the production runs alone, and the default run still finds the development copy and the peer.

#### Examples

```jsonc title="Avoid"
// packages/cart/knip.jsonc
{
  "ignoreDependencies": [
    // Why: an optional peer the ./react entry imports
    "react"
  ]
}
```

```jsonc title="Prefer"
// packages/cart/knip.jsonc
{
  "ignoreDependencies": [
    // Why: an optional peer the ./react entry imports, unlisted only in production runs
    "react!"
  ]
}
```
