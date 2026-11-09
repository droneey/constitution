# Distribution

> Governs how Renovate updates a distributed package's ranges.

## General

### consumer-owned-range-widened-keeping-its-floor → consumer-owned-dependency-ranged-from-its-lowest-version · MUST

Every range of a consumer-owned dependency that Renovate updates is widened to take the new release, its floor kept.

#### Why

A raised floor drops support for the versions its consumers still run, so their next install of the package fails or splits their tooling in two.

#### Examples

```json title="Avoid"
{
  "packageRules": [
    {
      "matchFileNames": ["packages/client/package.json"],
      "matchDepTypes": ["peerDependencies"],
      "rangeStrategy": "bump"
    }
  ]
}
```

```json title="Prefer"
{
  "packageRules": [
    {
      "matchFileNames": ["packages/client/package.json"],
      "matchDepTypes": ["peerDependencies"],
      "rangeStrategy": "widen"
    }
  ]
}
```
