# TanStack Router

## layout-lives-in-route-file · SHOULD
A layout is a pathless `_name/route.tsx` that renders `<Outlet/>`, never an `index.tsx`.

| Why | Check | Tags |
|---|---|---|
| an `index.tsx` is a leaf route, and a layout placed there renders nothing below it. | review | [] |

## error-component-per-route · SHOULD
Each route that loads data declares its error component; the root declares the not-found one.

| Why | Check | Tags |
|---|---|---|
| a failed loader then costs its route, with its own message, not the whole application. | review | [errors, ux] |

## guards-in-before-load · SHOULD
Access control of a route sits in its `beforeLoad`, and ends in `redirect`.

| Why | Check | Tags |
|---|---|---|
| the guard runs before the screen loads anything, so a denied user sees nothing of it. | review | [security] |

## tanstack-router-file-names-kept → kebab-case-file-names
Beside kebab-case, a route keeps the names TanStack Router reads: `__root.tsx`, a pathless layout `_auth.tsx`, a group `(shop)/`, a parameter `$orderId.tsx`, and a route that leaves its parent's layout, `posts_.tsx`.

| Why | Check | Tags |
|---|---|---|
| the router builds its tree from these names alone. | tool/names | [] |

## links-name-typed-targets · SHOULD
A link names its route by typed `to` and `params`, never a path built from strings.

| Why | Check | Tags |
|---|---|---|
| a typed target fails the type check when the route moves; a built string fails in the user's hands. | review | [] |

## loader-declares-the-search-it-reads · SHOULD
A loader that reads search params declares them in `loaderDeps`.

| Why | Check | Tags |
|---|---|---|
| the loader then reruns when they change, and its cache entry is keyed by them. | review | [] |

## routes-split-automatically · SHOULD
The router's bundler plugin splits every route's code automatically (`autoCodeSplitting: true`).

| Why | Check | Tags |
|---|---|---|
| each screen then loads only its own code, with no split written by hand. | review | [] |

## route-tree-committed → generated-files-not-committed
`routeTree.gen.ts` is committed — the one generated file the application chooses to keep — and only the router's generator changes it.

| Why | Check | Tags |
|---|---|---|
| the type check of a fresh clone needs it, and the check may not generate files. | review | [] |

## router-claims-the-head → one-writer-per-shared-resource
The router claims the document's head: the root renders `<HeadContent/>`, and nothing else writes the head.

| Why | Check | Tags |
|---|---|---|
| the router changes the head with the route, so a second writer would fight it on every navigation. | review | [] |

## search-falls-back-to-defaults · SHOULD
A route's search schema gives every param a default, so a malformed URL opens the screen with its defaults instead of an error.

| Why | Check | Tags |
|---|---|---|
| a shared or old link still opens the screen. | review | [] |
