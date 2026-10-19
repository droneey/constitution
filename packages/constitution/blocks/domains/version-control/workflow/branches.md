# Branches

> Governs a branch's name and its end.

## General

### branch-named-type-issue-name · MUST

A branch is named `feature/`, `fix/` or `hotfix/`, then `<issue>-<name>`: the issue's number, and a name of lowercase words and digits joined by hyphens. An update bot's branches are exempt.

| Why | Tags |
|---|---|
| the name ties the branch to its issue and tells the release automation which version to bump. | [] |

### merged-branch-deleted · SHOULD

A branch is deleted once its change request is merged; the host deletes it on merge where it can.

| Why | Tags |
|---|---|
| a merged branch left behind invites a push that no longer reaches the main line, and the list of branches stops saying what is in flight. | [] |
