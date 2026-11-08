# Worktrees

> Governs a worktree and its folders.

## General

### worktree-holds-no-linked-folder → machine-local-files-ignored · MUST

No worktree holds, in a folder's place, a link into another checkout, such as a shared `node_modules` or `.venv`.

| Why |
|---|
| a link is a file, not a folder, so an ignore pattern written for the folder (`node_modules/` or `.venv/`) misses it, and one machine's link is committed. |
