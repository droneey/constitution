# Updates

> Governs how dependency updates arrive.

## General

### dependencies-updated-by-the-bot · SHOULD

Every dependency update arrives as a change request Renovate opens.

#### Why

Updates left to a person pile up until one large update breaks many things at once, and the cause is then hard to find among them.

#### Examples

```yaml title="Avoid"
# .github/workflows/update.yml
on:
  schedule:
    - cron: '0 6 * * 1'
jobs:
  update:
    runs-on: ubuntu-24.04
    steps:
      - run: bun update && git commit --all --message "chore: update dependencies" && git push
```

```json title="Prefer"
{
  "extends": ["github>droneey/renovate-config#v1.4.0"]
}
```
