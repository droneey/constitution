# TypeScript with workspace

> The manifests and the alias of a TypeScript workspace.

## root-manifest-private → workspace-root-private
The root `package.json` of a workspace is `"private": true`.

| Why | Check | Tags |
|---|---|---|
| a package manager refuses to publish a manifest marked private, so the root can never be published by mistake. | review | [] |

## hash-alias-only-in-applications · MUST
Only an application, which no unit imports, declares and uses `#/`. A unit another unit imports from its source declares no `#/` in `imports` or `paths`, and its files import each other by relative path.

| Why | Check | Tags |
|---|---|---|
| the compiler applies the `paths` of the program it checks to every file it compiles, so a `#/` inside an imported unit resolves into the importer's `src/` and the importer fails to compile. | review | [] |
