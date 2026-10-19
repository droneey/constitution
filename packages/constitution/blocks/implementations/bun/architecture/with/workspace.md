# Workspace

> The globs of a Bun workspace laid out by the workspace's tree.

### workspaces-globbed-by-the-tree · SHOULD

`workspaces` lists the globs `apps/*` and `packages/*`, and each of them with `/languages/typescript` after it.

| Why | Tags |
|---|---|
| Bun 1.4.3 skips a folder a glob matches without a `package.json`, so these globs take every TypeScript package of a unit in one language or in several and pass over the others, while a path without a `package.json` fails the install. | [] |
