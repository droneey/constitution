# Worktrees

> Governs a worktree and its folders.

## General

### worktree-holds-no-linked-folder · MUST

No folder of a worktree is a link into another checkout, such as a shared `node_modules`.

| Why |
|---|
| a link is a file, not a folder, so an ignore pattern written for the folder (`node_modules/`) misses it and it is committed. |
