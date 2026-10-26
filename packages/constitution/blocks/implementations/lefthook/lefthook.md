---
id: lefthook
summary: Git hooks that check branch names, messages and staged changes.
requires: [git, yaml]
extends: null
abstract: false
languages: []
governs: ["lefthook.yaml"]
---

# Lefthook

> **Lefthook**, the **`lefthook`** command, runs the git hooks, as **`lefthook.yaml`** and a developer's **`lefthook-local.yaml`** set them; **`LEFTHOOK`** set to `0` would skip them.

Its configuration holds every active rule on commit messages and branch names — the branch name in `pre-commit`, the message in `commit-msg`; a rule on them it cannot hold is reported, and needs review or an override. `constitution` writes the jobs of every block, and a job of the project's own that takes the name of one merges into it.
