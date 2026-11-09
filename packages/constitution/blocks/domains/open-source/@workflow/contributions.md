# Contributions

> Governs how a change someone outside the project proposes runs in continuous integration.

## General

### outside-change-runs-without-secrets → credential-has-least-privilege · MUST

Every continuous-integration run of a change from outside the project holds no secret, only read rights and no cache it can write. Such a change is one someone outside the project proposes. Exempt: a run a maintainer approved for that change.

#### Why

A contribution's code runs with whatever its run holds, and every secret and writable cache it reaches is the attacker's — least privilege.

#### Examples

```text title="Avoid"
pipeline check
  runs on   every pull request, forks included
  secrets   DEPLOY_TOKEN, REGISTRY_TOKEN
  rights    write
  cache     read and write
```

```text title="Prefer"
pipeline check
  runs on   every pull request, forks included
  secrets   none
  rights    read
  cache     read only

pipeline check-with-secrets
  runs on   a fork's change a maintainer approved
```
