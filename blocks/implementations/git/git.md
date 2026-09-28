---
id: git
summary: Git's commits, branches, tags, ignores and worktrees.
requires: [version-control]
extends: null
abstract: false
checks: []
dictionary: [Git, git, .gitignore, .gitattributes, .gitkeep, Git LFS, commit-msg, pre-commit]
governs: [".gitignore", ".gitattributes"]
---

# Git

> Version control with git: how changes are staged, what is ignored, annotated tags, large files and worktrees. A git-flow framework extends this block and may tighten it. Its hooks check version-control's formats of commits and branches, under the `commits` role.
