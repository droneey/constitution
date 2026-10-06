# Security

## Dependencies

## hooks-and-release-automation-from-the-shared-source → shared-configuration-from-one-pinned-source
The commit hooks, the update policy and the release automation come from the same pinned shared source as the tools' configuration, never from scripts copied into each repository.

| Why | Check | Tags |
|---|---|---|
| a fix to a hook or to the release reaches every repository with one update, and no copy drifts. | review | [security] |
