# Hooks

> Governs how Lefthook's hooks may be turned off.

## General

### lefthook-never-turned-off → hooks-never-bypassed · MUST

No commit is made with `LEFTHOOK=0`, save the release automation's version commit.

| Why |
|---|
| `LEFTHOOK=0` skips every hook without a word, so a commit made with it passes none of their checks. |
