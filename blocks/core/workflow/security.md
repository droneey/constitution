# Security

## Dependencies

## dependencies-updated-by-bot · SHOULD
Dependency updates arrive as pull requests from an update bot, each passing the check before it is merged.
**Why:** updates that arrive on their own, small and checked, keep the project current without a risky update all at once.
**Check:** review
**Tags:** security, workflow

## shared-tooling-from-pinned-packages · SHOULD
Commit hooks, linter configurations and release automation come from shared, pinned packages, not from copies in each repository.
**Why:** a copy drifts and is fixed in one repository at a time; a shared package is fixed once and adopted by an update.
**Check:** review
**Tags:** security, workflow
