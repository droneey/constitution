# Branches

> Governs a branch's name and its end.

## General

### branch-named-type-issue-name · MUST

A branch is named by its type, its issue's number and a name. Its type is **`feature/`**{#feature-branch}, **`fix/`**{#fix-branch} or **`hotfix/`**{#hotfix-branch}, followed by `<issue>-<name>`: the issue's number, and a name of lowercase words and digits joined by hyphens. The branches of an **update bot**, the bot that proposes dependency updates, are exempt.

| Why |
|---|
| a branch named without its issue's number cannot be traced to its issue, and one named without its type leaves the release automation to bump the wrong version. |

### merged-branch-deleted · SHOULD

A branch is deleted once its change request is merged. The host deletes it on merge where it can.

| Why |
|---|
| a merged branch left behind invites a push that no longer reaches the main line, and the list of branches stops saying what is in flight. |
