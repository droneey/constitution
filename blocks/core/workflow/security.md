# Security

## Dependencies

### hooks-and-release-automation-from-the-shared-source · SHOULD
The commit hooks, the update policy and the release automation come from the same pinned shared source as the tools' configuration, never from scripts copied into each repository.

| Why | Tags |
|---|---|
| a fix to a hook or to the release reaches every repository with one update, and no copy drifts. | [security] |
