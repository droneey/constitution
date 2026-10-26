---
id: git
summary: Git's ignores, tags, large files and worktrees.
requires: [version-control]
extends: null
abstract: false
languages: []
governs: [".gitignore", ".gitattributes"]
---

# Git

> Version control with **Git**, through the **`git`** command: what is ignored, annotated tags, large files and worktrees.

**`.gitignore`**{#ignore-list} lists what is ignored, **`.gitattributes`**{#file-attributes} how files are treated, a **`.gitkeep`**{#empty-folder-keeper} keeps an empty folder, and **Git LFS** stores large files. Git runs a hook at each step of a commit: **`pre-commit`** before it is made, **`commit-msg`** on its message.

A git-flow framework requires this block and may tighten it.
