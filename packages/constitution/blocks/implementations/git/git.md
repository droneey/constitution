---
id: git
summary: Git's ignores, tags, large files and worktrees.
requires: [version-control]
languages: []
governs: [".gitignore", ".gitattributes"]
---

# Git

> Version control with Git, through the `git` command: what is ignored, how release tags are made, large files and worktrees.

`.gitignore` lists what is ignored and `.gitattributes` how files are treated; a `.gitkeep` keeps an empty folder, and Git LFS stores large files outside the history. Git runs a hook at each step of a version-control commit: `pre-commit` before it is made, `commit-msg` on its message.
