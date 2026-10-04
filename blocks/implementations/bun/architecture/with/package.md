# Bun with package

## workspaces-follow-the-package-layout → package-repository-layout
The root's `workspaces` is `["packages/*/<language>/*"]`, the homes the layout gives the packages.

| Why | Check | Tags |
|---|---|---|
| the workspace links exactly the packages the layout places, and a new product needs no change to it. | review | [] |

## root-manifest-private → package-root-private
The root `package.json` is `"private": true`.

| Why | Check | Tags |
|---|---|---|
| a package manager refuses to publish a manifest marked private, so the root can never be published by mistake. | review | [] |
