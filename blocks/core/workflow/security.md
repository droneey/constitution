# Security

## Secrets

## secrets-scanned-before-each-commit → no-secret-in-repository
The commit hooks scan the staged changes for secrets before each commit.

| Why | Check | Tags |
|---|---|---|
| a secret stopped before the commit never reaches history, where it is compromised for good. | review | [] |

## Dependencies

## dependencies-updated-by-bot · SHOULD
Dependency updates arrive as pull requests from an update bot, each passing the check before it is merged.

| Why | Check | Tags |
|---|---|---|
| updates that arrive on their own, small and checked, keep the project current without a risky update all at once. | review | [security] |

## shared-tooling-from-pinned-packages · SHOULD
Commit hooks, linter configurations and release automation come from shared packages, installed and pinned like any other dependency, not from copies in each repository.

| Why | Check | Tags |
|---|---|---|
| a copy drifts and is fixed in one repository at a time; a shared package is fixed once and adopted by an update. | review | [security] |
