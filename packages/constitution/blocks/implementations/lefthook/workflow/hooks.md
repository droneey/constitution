# Hooks

> Governs how Lefthook's hooks may be turned off and what its commit-msg hook rejects.

## General

### lefthook-never-turned-off → hooks-never-bypassed · MUST

No commit is made with `LEFTHOOK=0`. The release automation's version commit is the one exception.

| Why |
|---|
| `LEFTHOOK=0` skips every hook without a word, so a commit made with it passes none of their checks. |

### commit-subject-never-a-placeholder → commit-subject-says-what-changed · MUST

The `commit-msg` hook rejects a subject that only names a placeholder, one of the list its preset holds.

| Why |
|---|
| a placeholder subject makes the history useless at exactly the commit someone needs to understand. |
