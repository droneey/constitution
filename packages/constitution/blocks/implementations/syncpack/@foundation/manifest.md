# Manifest

> Governs the order of a manifest's fields.

## General

### syncpack-holds-the-field-order · MUST

Every `package.json` keeps its fields in one order, which Syncpack holds. The order runs from what names the package, its name, version, privacy and description, through what a registry shows of it, its keywords, homepage, bugs, licence, author and repository, and how it loads, its module type, package manager, executables, entries and files, to its scripts, its workspaces and its dependencies, the peer ones last.

#### Why

Manifests that each order their fields their own way keep a field in a different place in each, and a diff shows a moved field as a change.

#### Examples

```json title="Avoid"
{
  "scripts": { "check": "bun run --sequential 'check:*'" },
  "dependencies": { "zod": "4.1.12" },
  "name": "@shop/api",
  "type": "module",
  "private": true
}
```

```json title="Prefer"
{
  "name": "@shop/api",
  "private": true,
  "type": "module",
  "scripts": { "check": "bun run --sequential 'check:*'" },
  "dependencies": { "zod": "4.1.12" }
}
```
