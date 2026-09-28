---
id: lefthook
summary: Git hooks that check branch names, messages and staged changes.
requires: []
extends: git
abstract: false
checks: [commits]
dictionary: [Lefthook, lefthook, lefthook.yaml, lefthook-local.yaml, LEFTHOOK, commit-msg, pre-commit]
governs: ["lefthook.yaml"]
---

# Lefthook

> Runs the git hooks. Its configuration holds every active rule whose check is `tool — commits` — the branch name in `pre-commit`, the message in `commit-msg` — starting from the devkit preset; a `commits` rule it cannot hold is reported, and needs review or an override.
