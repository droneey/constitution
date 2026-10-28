# Workspace

> Governs the globs of a Bun workspace laid out by the workspace's tree.

## General

### workspaces-globbed-by-the-tree · SHOULD

`workspaces` lists the globs `apps/*` and `packages/*`, and for each group folder the glob of its units, `apps/<group>/*` or `packages/<group>/*`.

| Why |
|---|
| Bun 1.4.3 skips a folder a glob matches without a `package.json`, so these globs take every package with one, alone or in a group, and pass over the group folders and the other languages' packages, while a path without a `package.json` fails the install, and a glob of two folders everywhere, `packages/*/*`, would take a folder inside a unit that holds one. |
