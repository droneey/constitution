---
id: lefthook
summary: Git hooks that check branch names, messages and staged changes.
requires: [git]
extends: null
abstract: false
languages: []
dictionary: [Lefthook, lefthook, lefthook.yaml, lefthook-local.yaml, LEFTHOOK, commit-msg, pre-commit]
governs: ["lefthook.yaml"]
---

# Lefthook

> Runs the git hooks.

Lefthook's configuration holds every active rule on commit messages and branch names — the branch name in `pre-commit`, the message in `commit-msg`; a rule on them it cannot hold is reported, and needs review or an override. A job a later configuration names like a job of a part merges into it, so a project narrows a part's job by its name.
