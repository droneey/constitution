# TanStack Query

> Governs routes that load server data through the query cache, and screens whose reads suspend into the route's pending and error components.

## General

### loaders-read-through-the-query-cache → fact-has-one-source · MUST

Loaders and guards read through the query cache, and the router's own cache is off. They read the read's `queryOptions` through the query client, and `defaultPreloadStaleTime: 0` turns the router's cache off.

| Why |
|---|
| a second cache in the router keeps its own copy of the server's data, so a screen shows a stale copy after the query cache was refreshed — a single source of truth. |

### reads-suspend-into-the-route · MAY

A screen's read may suspend — `useSuspenseQuery` — when its route declares the pending and error components that catch it.

| Why |
|---|
| a suspended read whose route declares no pending or error component falls to a boundary above it, which blanks more than the screen; with them, the route shows its own states and the screen renders only data it has. |

### error-retry-resets-the-failed-read · SHOULD

A route's error component retries by resetting the failed reads. It resets them and invalidates the router, never only renders again.

| Why |
|---|
| rendering again replays the cached failure, so the user's retry shows the same error; only a reset read is fetched again. |
