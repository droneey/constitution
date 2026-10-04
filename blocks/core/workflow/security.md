# Security

## Dependencies

## shared-tooling-from-pinned-packages · SHOULD
Commit hooks, linter configurations and release automation come from shared packages, installed and pinned like any other dependency, not from copies in each repository.

| Why | Check | Tags |
|---|---|---|
| a copy drifts and is fixed in one repository at a time; a shared package is fixed once and adopted by an update. | review | [security] |
