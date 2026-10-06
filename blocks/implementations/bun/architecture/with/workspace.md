# Bun with workspace

> The globs of a Bun workspace laid out by the workspace's tree.

### workspaces-globbed-by-the-tree · SHOULD
`workspaces` lists the globs `packages/*`, `packages/*/typescript`, `libs/*` and `libs/*/typescript`, and the path of the package of `shared/`.

| Why | Tags |
|---|---|
| Bun 1.4.2 skips a folder a glob matches without a `package.json`, so these globs take every TypeScript package of a unit in one language or in several and pass over the others, while a path without a `package.json` fails the install. | [] |
