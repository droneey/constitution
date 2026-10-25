# Worktrees

> Governs a worktree and its folders.

## General

### worktree-one-branch-no-linked-folder · MUST

A worktree holds one branch, and no folder of it is a link into another checkout.

| Why |
|---|
| a linked folder escapes the ignore pattern and gets committed, and two worktrees on one branch overwrite each other. |
