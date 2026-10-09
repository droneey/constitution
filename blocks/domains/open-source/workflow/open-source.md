# Open source

> Governs how a contribution from outside runs in CI.

## Contributions

### outside-change-runs-without-secrets → credential-has-least-privilege · MUST
A contribution from outside the repository runs in CI with no secret, a read-only token and no cache it can write; a run that needs more waits for a maintainer's approval of that change.

| Why | Tags |
|---|---|
| a contribution's code runs with whatever its run holds, and every secret and writable cache it reaches is the attacker's. | [security] |
