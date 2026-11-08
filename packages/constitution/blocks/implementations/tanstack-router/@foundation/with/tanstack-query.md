# TanStack Query

> Governs routes that load server data through the query cache, and screens whose reads suspend into the route's own components.

## General

### loaders-read-through-the-query-cache → remote-data-lives-only-in-its-cache · MUST

Every loader and guard reads through the query cache, and the router's own copy never answers a read. They read the read's `queryOptions` through the query client; `defaultPreloadStaleTime: 0` makes the router's copy stale at once, and `defaultStaleTime` stays at its default, 0.

| Why |
|---|
| a second cache in the router keeps its own copy of the server's data, so a screen shows a stale copy after the query cache was refreshed. |

### reads-suspend-into-the-route · SHOULD

Every route whose screen suspends a read, by `useSuspenseQuery`, declares its `pendingComponent`.

| Why |
|---|
| a suspended read whose route declares no component for its wait falls to a boundary above it, which blanks more than the screen. |

### error-retry-resets-the-failed-read · MUST

Every route hands its error component a retry that resets the failed reads and invalidates the router; it never hands one that only renders again.

| Why |
|---|
| rendering again replays the cached failure, so the user's retry shows the same error; only a reset read is fetched again. |
