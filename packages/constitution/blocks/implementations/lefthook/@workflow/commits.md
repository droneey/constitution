# Commits

> Governs what Lefthook's `commit-msg` hook rejects.

## General

### commit-msg-hook-rejects-a-placeholder-subject → commit-subject-says-what-changed · MUST

The `commit-msg` hook rejects every subject that is only a placeholder, such as “update”, “wip” or “fix stuff”.

| Why |
|---|
| a placeholder subject makes the repository history useless at exactly the version-control commit someone needs to understand, and a hook stops it before it is recorded. |
