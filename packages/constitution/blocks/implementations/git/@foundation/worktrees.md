# Worktrees

> Governs a worktree and its folders.

## General

### worktree-holds-no-linked-folder → machine-local-files-ignored · MUST

No worktree holds, in a folder's place, a link into another checkout, such as a shared `node_modules` or `.venv`.

#### Why

A link is a file, not a folder, so an ignore pattern written for the folder (`node_modules/` or `.venv/`) misses it, and one machine's link is committed.

#### Examples

```bash title="Avoid"
git worktree add ../shop-refunds feature/140-partial-refunds
ln -s ../shop/node_modules ../shop-refunds/node_modules
```

```bash title="Prefer"
git worktree add ../shop-refunds feature/140-partial-refunds
cd ../shop-refunds && bun install
```
