---
id: lefthook
summary: Git hooks that check branch names, messages and staged changes.
requires: [git]
languages: []
governs: ["lefthook.yaml"]
---

# Lefthook

> Lefthook, the `lefthook` command, runs the commit hooks, as `lefthook.yaml` and a developer's `lefthook-local.yaml` set them.

`constitution` writes the jobs of every block into `lefthook.yaml`: the version-control branch's name is checked in `pre-commit`, the commit message in `commit-msg`. A job of the project's own that takes the name of one merges into it.
